import ComposableArchitecture
import SwiftUI

@Reducer
struct JourneyFeature {
    struct State: Equatable {
        var sparksCount: Int = 0
        var currentLevelIndex: Int = 0
        var levels: [LevelDefinition] = []
        /// Which Firestore student doc all writes target. Anon flows
        /// (no sign-in) use `FirestoreSchema.defaultStudentId`. After
        /// the parent signs in + the child picker resolves, RootFeature
        /// updates this to the picked student's ID.
        var studentId: String = FirestoreSchema.defaultStudentId
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
    @Dependency(\.firestoreClient) var firestoreClient
    @Dependency(\.authClient) var authClient
    @Dependency(\.crashlyticsClient) var crashlyticsClient

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
                let levelIndex = state.levels.firstIndex(of: level)
                if let index = levelIndex, index == state.currentLevelIndex {
                    state.currentLevelIndex += 1
                }
                state.missionComplete = MissionCompleteFeature.State(
                    levelTitle: level.title,
                    sparksAwarded: 10
                )
                let studentId = state.studentId
                return .run { [authClient, firestoreClient, database, crashlyticsClient] _ in
                    // Build both records once with stable UUIDs so the
                    // local SwiftData write and the Firestore sync stay
                    // in lockstep — same id on both sides.
                    let sparks = SparksRecord(amount: 10, reason: "mission_complete")
                    let progress = LessonProgress(
                        levelIndex: levelIndex ?? 0,
                        category: level.category.rawValue,
                        isCompleted: true,
                        score: 10
                    )
                    crashlyticsClient.log(
                        "mission_complete: level=\(level.id) category=\(level.category.rawValue)"
                    )
                    do {
                        try await database.addSparks(sparks)
                    } catch {
                        crashlyticsClient.recordError(error, "swiftdata.addSparks")
                    }
                    do {
                        try await database.saveProgress(progress)
                    } catch {
                        crashlyticsClient.recordError(error, "swiftdata.saveProgress")
                    }
                    if let uid = authClient.currentUserId() {
                        do {
                            try await firestoreClient.syncSparks(uid, studentId, sparks.dto)
                        } catch {
                            crashlyticsClient.recordError(error, "firestore.syncSparks")
                        }
                        do {
                            try await firestoreClient.syncLesson(uid, studentId, progress.dto)
                        } catch {
                            crashlyticsClient.recordError(error, "firestore.syncLesson")
                        }
                    }
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
