import ComposableArchitecture
import SwiftUI

@Reducer
struct LiteracyFeature {
    struct State: Equatable {
        let level: LevelDefinition
        var currentLetter: String
        var isTracingComplete: Bool = false
        
        init(level: LevelDefinition) {
            self.level = level
            self.currentLetter = level.targetValue
        }
    }
    
    enum Action {
        case tracingEnded(Bool)
        case doneTapped
    }
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .tracingEnded(success):
                state.isTracingComplete = success
                return .none
            case .doneTapped:
                return .none
            }
        }
    }
}
