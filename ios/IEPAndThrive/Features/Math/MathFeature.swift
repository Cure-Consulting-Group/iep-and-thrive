import ComposableArchitecture
import SwiftUI

@Reducer
struct MathFeature {
    struct State: Equatable {
        let level: LevelDefinition
        var equation: String
        var currentCount: Int = 0
        
        init(level: LevelDefinition) {
            self.level = level
            self.equation = level.targetValue
        }
    }
    
    enum Action {
        case blocksChanged(Int)
        case backTapped
        case checkAnswerTapped
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .blocksChanged(count):
                state.currentCount = count
                return .none
            case .backTapped:
                return .none
            case .checkAnswerTapped:
                return .none
            }
        }
    }
}
