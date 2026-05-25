import XCTest
import ComposableArchitecture
@testable import IEPAndThrive

@MainActor
final class MonetizationTests: XCTestCase {
    func testPurchaseSuccess() async {
        let store = TestStore(initialState: PaywallFeature.State()) {
            PaywallFeature()
        } withDependencies: {
            \$0.storeKit.purchase = { _ in .success }
        }
        
        await store.send(.purchaseButtonTapped(.annual)) {
            \$0.isPurchasing = true
        }
        
        await store.receive(.purchaseSuccess) {
            \$0.isPurchasing = false
        }
    }
}
