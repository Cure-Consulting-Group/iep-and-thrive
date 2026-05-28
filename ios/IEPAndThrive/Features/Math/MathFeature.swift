import ComposableArchitecture
import SwiftUI

@Reducer
struct MathFeature {
    struct State: Equatable {
        let level: LevelDefinition
        let prompt: String
        let targetCount: Int?
        var currentCount: Int = 0
        var showIncorrectHint: Bool = false

        init(level: LevelDefinition) {
            self.level = level
            self.prompt = level.mathPrompt
            self.targetCount = level.targetCount
        }

        var canCheck: Bool {
            currentCount > 0
        }

        /// True when the placed cube count satisfies the level's goal.
        /// Levels without a defined `targetCount` fall back to "any
        /// placement" — `currentCount > 0` — as the P0 fallback.
        var isCorrect: Bool {
            if let target = targetCount {
                return currentCount == target
            }
            return currentCount > 0
        }
    }

    enum Action {
        case blocksChanged(Int)
        case backTapped
        case checkAnswerTapped
        case dismissHint
    }

    @Dependency(\.crashlyticsClient) var crashlyticsClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .blocksChanged(count):
                state.currentCount = count
                if state.showIncorrectHint && state.isCorrect {
                    state.showIncorrectHint = false
                }
                return .none

            case .backTapped:
                return .none

            case .checkAnswerTapped:
                let target = state.targetCount
                let actual = state.currentCount
                let pass = state.isCorrect
                let levelId = state.level.id
                if !state.isCorrect {
                    state.showIncorrectHint = true
                }
                return .run { [crashlyticsClient] _ in
                    crashlyticsClient.log(
                        "math: check level=\(levelId) target=\(target.map(String.init) ?? "nil") actual=\(actual) pass=\(pass)"
                    )
                }

            case .dismissHint:
                state.showIncorrectHint = false
                return .none
            }
        }
    }
}
