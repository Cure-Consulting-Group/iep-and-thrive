import ComposableArchitecture
import StoreKit
import Foundation

@Reducer
struct PaywallFeature {
    struct State: Equatable {
        var products: [Product] = []
        var isLoading: Bool = false
        var errorMessage: String?
    }
    
    enum Action {
        case task
        case productsResponse(Result<[Product], Error>)
        case purchaseButtonTapped(Product)
        case purchaseResponse(Result<Transaction?, Error>)
        case restoreButtonTapped
        case restoreResponse(Result<Void, Error>)
        case dismissButtonTapped
    }
    
    @Dependency(\.storeKit) var storeKit
    @Dependency(\.dismiss) var dismiss
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .task:
                state.isLoading = true
                state.errorMessage = nil
                return .run { send in
                    do {
                        let products = try await storeKit.products()
                        await send(.productsResponse(.success(products)))
                    } catch {
                        await send(.productsResponse(.failure(error)))
                    }
                }
                
            case let .productsResponse(.success(products)):
                state.isLoading = false
                state.products = products.sorted(by: { \$0.price < \$1.price })
                return .none
                
            case let .productsResponse(.failure(error)):
                state.isLoading = false
                state.errorMessage = "Failed to load products: \(error.localizedDescription)"
                return .none
                
            case let .purchaseButtonTapped(product):
                state.isLoading = true
                state.errorMessage = nil
                return .run { send in
                    do {
                        let transaction = try await storeKit.purchase(product)
                        await send(.purchaseResponse(.success(transaction)))
                    } catch {
                        await send(.purchaseResponse(.failure(error)))
                    }
                }
                
            case let .purchaseResponse(.success(transaction)):
                state.isLoading = false
                if transaction != nil {
                    return .run { _ in await dismiss() }
                }
                return .none
                
            case let .purchaseResponse(.failure(error)):
                state.isLoading = false
                state.errorMessage = "Purchase failed: \(error.localizedDescription)"
                return .none
                
            case .restoreButtonTapped:
                state.isLoading = true
                state.errorMessage = nil
                return .run { send in
                    do {
                        try await storeKit.restorePurchases()
                        await send(.restoreResponse(.success(())))
                    } catch {
                        await send(.restoreResponse(.failure(error)))
                    }
                }
                
            case .restoreResponse(.success):
                state.isLoading = false
                return .none
                
            case let .restoreResponse(.failure(error)):
                state.isLoading = false
                state.errorMessage = "Restore failed: \(error.localizedDescription)"
                return .none
                
            case .dismissButtonTapped:
                return .run { _ in await dismiss() }
            }
        }
    }
}

extension Error: Equatable {
    public static func == (lhs: Error, rhs: Error) -> Bool {
        lhs.localizedDescription == rhs.localizedDescription
    }
}
