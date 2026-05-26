import XCTest
import ComposableArchitecture
@testable import IEPAndThrive

@MainActor
final class MathFeatureTests: XCTestCase {
    func testBlocksChanged() async {
        let level = LevelDefinition(id: "test", title: "Test", category: .math, targetValue: "3 + 2 = ?", biome: .mountain)
        let store = TestStore(initialState: MathFeature.State(level: level)) {
            MathFeature()
        }
        
        await store.send(.blocksChanged(5)) {
            \$0.currentCount = 5
        }
    }
}
