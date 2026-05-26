import ComposableArchitecture
import SwiftUI

@Reducer
struct JourneyFeature {
    struct State: Equatable {
        var sparksCount: Int = 0
        var currentLevelIndex: Int = 0
        var levels: [LevelDefinition] = []
        @PresentationState var levelPreview: LevelPreviewFeature.State?
        @PresentationState var missionComplete: MissionCompleteFeature.State?

        func isUnlocked(_ level: LevelDefinition) -> Bool {
            guard let index = levels.firstIndex(of: level) else { return false }
            return index <= currentLevelIndex
        }
    }

    enum Action {
        case onAppear
        case loadLevels([LevelDefinition])
        case nodeTapped(LevelDefinition)
        case safeSpaceTapped
        case levelPreview(PresentationAction<LevelPreviewFeature.Action>)
        case missionComplete(LevelDefinition)
        case missionCompleteSheet(PresentationAction<MissionCompleteFeature.Action>)
    }

    @Dependency(\.curriculumClient) var curriculumClient
    @Dependency(\.database) var database

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                return .run { send in
                    await send(.loadLevels(curriculumClient.levels()))
                }

            case let .loadLevels(levels):
                state.levels = levels
                return .none

            case let .nodeTapped(level):
                guard state.isUnlocked(level) else { return .none }
                state.levelPreview = LevelPreviewFeature.State(level: level)
                return .none

            case let .missionComplete(level):
                state.sparksCount += 10
                if let index = state.levels.firstIndex(of: level), index == state.currentLevelIndex {
                    state.currentLevelIndex += 1
                }
                state.missionComplete = MissionCompleteFeature.State(
                    levelTitle: level.title,
                    sparksAwarded: 10
                )
                return .run { _ in
                    try? await database.addSparks(10, "mission_complete")
                }

            case .safeSpaceTapped:
                return .none

            case .levelPreview:
                return .none

            case .missionCompleteSheet:
                return .none
            }
        }
        .ifLet(\.$levelPreview, action: \.levelPreview) {
            LevelPreviewFeature()
        }
        .ifLet(\.$missionComplete, action: \.missionCompleteSheet) {
            MissionCompleteFeature()
        }
    }
}

@Reducer
struct LevelPreviewFeature {
    struct State: Equatable {
        let level: LevelDefinition
    }

    enum Action {
        case startButtonTapped(LevelDefinition)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .startButtonTapped:
                return .none
            }
        }
    }
}

@Reducer
struct MissionCompleteFeature {
    struct State: Equatable {
        let levelTitle: String
        let sparksAwarded: Int
    }

    enum Action {
        case continueTapped
    }

    @Dependency(\.dismiss) var dismiss

    var body: some ReducerOf<Self> {
        Reduce { _, action in
            switch action {
            case .continueTapped:
                return .run { _ in await dismiss() }
            }
        }
    }
}
