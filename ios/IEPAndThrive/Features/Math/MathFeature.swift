import ComposableArchitecture
import SwiftUI

@Reducer
struct MathFeature {
    struct State: Equatable {
        var equation: String = "3 + 2 = ?"
        var currentCount: Int = 0
    }
    
    enum Action {
        case blocksChanged(Int)
        case checkAnswerTapped
    }
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .blocksChanged(count):
                state.currentCount = count
                return .none
            case .checkAnswerTapped:
                return .none
            }
        }
    }
}
