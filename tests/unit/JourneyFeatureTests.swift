import XCTest
import ComposableArchitecture
@testable import IEPAndThrive

@MainActor
final class JourneyFeatureTests: XCTestCase {
    func testNodeTapped() async {
        let level = LevelDefinition(id: "test", title: "Test", category: .literacy, targetValue: "a", biome: .forest)
        let store = TestStore(initialState: JourneyFeature.State(levels: [level])) {
            JourneyFeature()
        }
        
        await store.send(.nodeTapped(level)) {
            \$0.levelPreview = LevelPreviewFeature.State(level: level)
        }
    }
}
