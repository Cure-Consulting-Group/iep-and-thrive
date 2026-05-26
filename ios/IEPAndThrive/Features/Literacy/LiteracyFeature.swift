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
        case onAppear
        case tracingEnded(Bool)
        case speakLetterTapped
        case backTapped
        case doneTapped
    }
    
    @Dependency(SpeechClient.self) var speechClient
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                let text = state.currentLetter
                return .run { _ in await speechClient.speak(text) }
                
            case let .tracingEnded(success):
                state.isTracingComplete = success
                return .none
                
            case .speakLetterTapped:
                let text = state.currentLetter
                return .run { _ in await speechClient.speak(text) }

            case .backTapped:
                return .none

            case .doneTapped:
                return .none
            }
        }
    }
}
