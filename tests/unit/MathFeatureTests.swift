import XCTest
import ComposableArchitecture
@testable import IEPAndThrive

@MainActor
final class MathFeatureTests: XCTestCase {
    func testBlocksChanged() async {
        let store = TestStore(initialState: MathFeature.State()) {
            MathFeature()
        }
        
        await store.send(.blocksChanged(5)) {
            $0.currentCount = 5
        }
    }
}
