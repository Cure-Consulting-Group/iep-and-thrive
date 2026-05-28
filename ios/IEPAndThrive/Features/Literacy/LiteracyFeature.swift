import ComposableArchitecture
import SwiftUI

@Reducer
struct LiteracyFeature {
    struct State: Equatable {
        let level: LevelDefinition
        var currentLetter: String
        var isTracingComplete: Bool = false
        var showTraceHint: Bool = false

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
    @Dependency(\.crashlyticsClient) var crashlyticsClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                let text = state.currentLetter
                return .run { _ in await speechClient.speak(text) }

            case let .tracingEnded(success):
                state.isTracingComplete = success
                state.showTraceHint = !success
                let letter = state.currentLetter
                return .run { [crashlyticsClient] _ in
                    crashlyticsClient.log(
                        "literacy: tracingEnded letter=\(letter) pass=\(success)"
                    )
                }

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
