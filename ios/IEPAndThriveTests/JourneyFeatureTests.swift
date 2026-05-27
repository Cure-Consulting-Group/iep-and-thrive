import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class JourneyFeatureTests: XCTestCase {

    private static let testLevels: [LevelDefinition] = [
        LevelDefinition(id: "lit-1", title: "Short Vowel 'a'", category: .literacy, targetValue: "a", biome: .forest),
        LevelDefinition(id: "lit-2", title: "Short Vowel 'e'", category: .literacy, targetValue: "e", biome: .forest),
        LevelDefinition(id: "lit-3", title: "Short Vowel 'i'", category: .literacy, targetValue: "i", biome: .forest),
    ]

    func test_onAppear_loadsLevelsFromCurriculum() async {
        let store = TestStore(initialState: JourneyFeature.State()) {
            JourneyFeature()
        } withDependencies: {
            $0.curriculumClient.levels = { Self.testLevels }
        }

        await store.send(.onAppear)
        await store.receive(\.loadLevels) {
            $0.levels = Self.testLevels
        }
    }

    func test_tapOnUnlockedLevel_opensPreview() async {
        let level = Self.testLevels[0]
        let store = TestStore(
            initialState: JourneyFeature.State(
                currentLevelIndex: 0,
                levels: Self.testLevels
            )
        ) {
            JourneyFeature()
        }

        await store.send(.nodeTapped(level)) {
            $0.levelPreview = LevelPreviewFeature.State(level: level)
        }
    }

    func test_tapOnLockedLevel_isNoOp() async {
        let lockedLevel = Self.testLevels[2] // index 2 with currentLevelIndex 0 → locked
        let store = TestStore(
            initialState: JourneyFeature.State(
                currentLevelIndex: 0,
                levels: Self.testLevels
            )
        ) {
            JourneyFeature()
        }

        // No state change expected — locked node taps must not open the
        // preview. This is the gate PR #13 added.
        await store.send(.nodeTapped(lockedLevel))
    }

    func test_missionComplete_advancesIndexAndAwardsSparks() async {
        let sparksAwarded = Box<SparksRecord?>(nil)
        let progressSaved = Box<LessonProgress?>(nil)
        let sparksSync = Box<(String, SparksRecordDTO)?>(nil)
        let lessonSync = Box<(String, LessonProgressDTO)?>(nil)

        let store = TestStore(
            initialState: JourneyFeature.State(
                currentLevelIndex: 0,
                levels: Self.testLevels
            )
        ) {
            JourneyFeature()
        } withDependencies: {
            $0.database.addSparks = { record in
                sparksAwarded.setValue(record)
            }
            $0.database.saveProgress = { record in
                progressSaved.setValue(record)
            }
            $0.authClient.currentUserId = { "test-uid" }
            $0.firestoreClient.syncSparks = { uid, dto in
                sparksSync.setValue((uid, dto))
            }
            $0.firestoreClient.syncLesson = { uid, dto in
                lessonSync.setValue((uid, dto))
            }
        }

        let completed = Self.testLevels[0]
        await store.send(.missionComplete(completed)) {
            $0.sparksCount = 10
            $0.currentLevelIndex = 1
            $0.missionComplete = MissionCompleteFeature.State(
                levelTitle: completed.title,
                sparksAwarded: 10
            )
        }

        await store.finish()
        XCTAssertEqual(sparksAwarded.value?.amount, 10)
        XCTAssertEqual(sparksAwarded.value?.reason, "mission_complete")
        // Both records reach Firestore with their local UUIDs (lockstep).
        XCTAssertEqual(sparksSync.value?.0, "test-uid")
        XCTAssertEqual(sparksSync.value?.1.id, sparksAwarded.value?.id,
            "Sparks local + cloud writes must share a UUID.")
        XCTAssertEqual(lessonSync.value?.0, "test-uid")
        XCTAssertEqual(lessonSync.value?.1.id, progressSaved.value?.id,
            "Lesson local + cloud writes must share a UUID.")
    }

    func test_missionComplete_lessonProgressShape() async {
        // Verify the LessonProgress record carries the right metadata —
        // levelIndex maps the curriculum position, category names the
        // discipline ('literacy'/'math'), isCompleted reflects success.
        let progressSaved = Box<LessonProgress?>(nil)

        let store = TestStore(
            initialState: JourneyFeature.State(
                currentLevelIndex: 1,
                levels: Self.testLevels  // 3 literacy levels
            )
        ) {
            JourneyFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.database.saveProgress = { record in
                progressSaved.setValue(record)
            }
            $0.authClient.currentUserId = { nil }  // skip Firestore branch
        }

        let level = Self.testLevels[1]  // index 1 in test fixture
        await store.send(.missionComplete(level)) {
            $0.sparksCount = 10
            $0.currentLevelIndex = 2
            $0.missionComplete = MissionCompleteFeature.State(
                levelTitle: level.title,
                sparksAwarded: 10
            )
        }
        await store.finish()

        XCTAssertEqual(progressSaved.value?.levelIndex, 1)
        XCTAssertEqual(progressSaved.value?.category, "literacy")
        XCTAssertEqual(progressSaved.value?.isCompleted, true)
        XCTAssertEqual(progressSaved.value?.score, 10)
    }

    func test_missionComplete_doesNotAdvanceIndex_whenReplayingPreviousLevel() async {
        // If the child re-plays an already-completed level, sparks still
        // award (rewarding engagement), but currentLevelIndex must NOT
        // jump backwards or stay capped — it stays at its current value.
        let store = TestStore(
            initialState: JourneyFeature.State(
                currentLevelIndex: 2,
                levels: Self.testLevels
            )
        ) {
            JourneyFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.authClient.currentUserId = { nil }
        }

        let replay = Self.testLevels[0]
        await store.send(.missionComplete(replay)) {
            $0.sparksCount = 10
            $0.missionComplete = MissionCompleteFeature.State(
                levelTitle: replay.title,
                sparksAwarded: 10
            )
        }
        await store.finish()
    }

    func test_safeSpaceTapped_isNoOpInJourneyReducer() async {
        // The journey reducer treats safeSpaceTapped as a passthrough —
        // RootFeature is responsible for pushing the SafeSpace screen.
        // This test guards against accidentally adding journey-local state
        // changes to that action.
        let store = TestStore(initialState: JourneyFeature.State()) {
            JourneyFeature()
        }

        await store.send(.safeSpaceTapped)
    }
}
