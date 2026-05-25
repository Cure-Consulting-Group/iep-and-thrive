import XCTest
import ComposableArchitecture
@testable import IEPAndThrive

@MainActor
final class JourneyFeatureTests: XCTestCase {
    func testNodeTapped() async {
        let store = TestStore(initialState: JourneyFeature.State(unlockedLevels: [1])) {
            JourneyFeature()
        }
        
        await store.send(.nodeTapped(1)) {
            $0.selectedLevel = 1
        }
    }
}
