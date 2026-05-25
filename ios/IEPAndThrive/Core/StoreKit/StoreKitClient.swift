import Foundation
import StoreKit
import ComposableArchitecture

public struct StoreKitClient {
    public var products: @Sendable () async throws -> [Product]
    public var purchase: @Sendable (Product) async throws -> Transaction?
    public var currentEntitlements: @Sendable () async -> [Transaction]
    public var restorePurchases: @Sendable () async throws -> Void
    public var observeTransactions: @Sendable () -> AsyncStream<VerificationResult<Transaction>>
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
            Transaction.updates
        }
    )
    
    public static let testValue = Self(
        products: { [] },
        purchase: { _ in nil },
        currentEntitlements: { [] },
        restorePurchases: {},
        observeTransactions: { AsyncStream { _ in } }
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
