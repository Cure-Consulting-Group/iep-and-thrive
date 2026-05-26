import Foundation
import StoreKit
import ComposableArchitecture

public struct StoreKitClient {
    public var products: @Sendable () async throws -> [Product]
    public var purchase: @Sendable (Product) async throws -> Transaction?
    public var currentEntitlements: @Sendable () async -> [Transaction]
    public var restorePurchases: @Sendable () async throws -> Void
    public var observeTransactions: @Sendable () -> AsyncStream<VerificationResult<Transaction>>
    public var observeStatus: @Sendable () -> AsyncStream<Bool>
}

extension StoreKitClient: DependencyKey {
    public static let liveValue = Self(
        products: {
            // These would be configured in App Store Connect
            let productIds = ["iep_thrive_weekly", "iep_thrive_annual"]
            return try await Product.products(for: productIds)
        },
        purchase: { product in
            let result = try await product.purchase()
            switch result {
            case let .success(verification):
                switch verification {
                case let .verified(transaction):
                    await transaction.finish()
                    return transaction
                case .unverified:
                    throw StoreKitError.unverified
                }
            case .userCancelled:
                return nil
            case .pending:
                return nil
            @unknown default:
                return nil
            }
        },
        currentEntitlements: {
            var transactions: [Transaction] = []
            for await result in Transaction.currentEntitlements {
                if case let .verified(transaction) = result {
                    transactions.append(transaction)
                }
            }
            return transactions
        },
        restorePurchases: {
            try await AppStore.sync()
        },
        observeTransactions: {
            AsyncStream { continuation in
                let task = Task {
                    for await update in Transaction.updates {
                        continuation.yield(update)
                    }
                }
                continuation.onTermination = { _ in
                    task.cancel()
                }
            }
        },
        observeStatus: {
            AsyncStream { continuation in
                let task = Task {
                    // Check initial status
                    var hasPremium = false
                    for await result in Transaction.currentEntitlements {
                        if case .verified = result {
                            hasPremium = true
                            break
                        }
                    }
                    continuation.yield(hasPremium)
                    
                    // Observe updates
                    for await _ in Transaction.updates {
                        var updatedPremium = false
                        for await result in Transaction.currentEntitlements {
                            if case .verified = result {
                                updatedPremium = true
                                break
                            }
                        }
                        continuation.yield(updatedPremium)
                    }
                }
                continuation.onTermination = { _ in
                    task.cancel()
                }
            }
        }
    )
    
    public static let testValue = Self(
        products: { [] },
        purchase: { _ in nil },
        currentEntitlements: { [] },
        restorePurchases: {},
        observeTransactions: { AsyncStream { _ in } },
        observeStatus: { AsyncStream { _ in } }
    )
}

extension DependencyValues {
    public var storeKit: StoreKitClient {
        get { self[StoreKitClient.self] }
        set { self[StoreKitClient.self] = newValue }
    }
}

public enum StoreKitError: LocalizedError {
    case unverified
    
    public var errorDescription: String? {
        switch self {
        case .unverified:
            return "The transaction could not be verified by the App Store."
        }
    }
}
