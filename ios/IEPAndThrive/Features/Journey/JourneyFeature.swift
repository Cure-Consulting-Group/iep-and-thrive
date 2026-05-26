import ComposableArchitecture
import SwiftUI

@Reducer
struct JourneyFeature {
    struct State: Equatable {
        var sparksCount: Int = 0
        var currentLevelIndex: Int = 0
        var levels: [LevelDefinition] = []
        @PresentationState var levelPreview: LevelPreviewFeature.State?
    }
    
    enum Action {
        case onAppear
        case loadLevels([LevelDefinition])
        case nodeTapped(LevelDefinition)
        case safeSpaceTapped
        case levelPreview(PresentationAction<LevelPreviewFeature.Action>)
    }
    
    @Dependency(\.curriculumClient) var curriculumClient
    
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
                // For MVP, we'll assume all levels are clickable for testing
                state.levelPreview = LevelPreviewFeature.State(level: level)
                return .none
                
            case .safeSpaceTapped:
                return .none
                
            case .levelPreview:
                return .none
            }
        }
        .ifLet(\.$levelPreview, action: \.levelPreview) {
            LevelPreviewFeature()
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
