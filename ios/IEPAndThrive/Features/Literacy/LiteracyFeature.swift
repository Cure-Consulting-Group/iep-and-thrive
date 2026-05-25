import ComposableArchitecture
import SwiftUI

@Reducer
struct LiteracyFeature {
    struct State: Equatable {
        var currentLetter: String = "a"
        var isTracingComplete: Bool = false
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
