import ComposableArchitecture
import SwiftUI

@Reducer
struct JourneyFeature {
    struct State: Equatable {
        var sparksCount: Int = 0
        var currentLevel: Int = 1
        var unlockedLevels: Set<Int> = [1]
    }
    
    enum Action {
        case nodeTapped(Int)
        case safeSpaceTapped
    }
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .nodeTapped(level):
                if state.unlockedLevels.contains(level) {
                    // Logic to navigate to lesson
                }
                return .none
                
            case .safeSpaceTapped:
                // Logic to navigate to safe space
                return .none
            }
        }
    }
}
