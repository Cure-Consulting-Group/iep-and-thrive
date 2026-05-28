import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class CrashlyticsClientTests: XCTestCase {

    // MARK: - RootFeature

    func test_authResolved_setsCrashlyticsUserId() async {
        let capturedUid = Box<String?>(nil)

        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        } withDependencies: {
            $0.crashlyticsClient.setUserId = { uid in
                capturedUid.setValue(uid)
            }
        }

        await store.send(.authResolved("anon-uid-xyz")) {
            $0.currentUid = "anon-uid-xyz"
        }
        await store.finish()

        XCTAssertEqual(capturedUid.value, "anon-uid-xyz",
            "RootFeature must set Crashlytics user ID when auth resolves.")
    }

    func test_migration_failure_recordsToCrashlytics() async {
        // The migration is wrapped in a Crashlytics-aware helper that
        // catches errors and records them — failure must NOT prevent
        // the rest of the post-auth flow from succeeding.
        struct MigrateError: Error {}
        let recordedDomain = Box<String?>(nil)

        var initial = RootFeature.State()
        initial.currentUid = "anon-uid"
        initial.auth = AuthFeature.State()

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { _ in [] }
            $0.firestoreClient.migrateAnonData = { _, _, _ in throw MigrateError() }
            $0.crashlyticsClient.recordError = { _, domain in
                recordedDomain.setValue(domain)
            }
        }
        store.exhaustivity = .off

        await store.send(.auth(.presented(.delegate(.signedIn(uid: "new-authed-uid")))))
        await store.receive(\.studentsFetched)
        await store.finish()

        XCTAssertEqual(recordedDomain.value, "firestore.migrateAnonData",
            "Failed migration must be recorded to Crashlytics with its domain.")
    }

    func test_fetchAllStudents_failure_recordsAndFallsBack() async {
        struct FetchError: Error {}
        let recordedDomain = Box<String?>(nil)

        var initial = RootFeature.State()
        initial.currentUid = "anon-uid"
        initial.auth = AuthFeature.State()

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { _ in throw FetchError() }
            $0.firestoreClient.migrateAnonData = { _, _, _ in }
            $0.crashlyticsClient.recordError = { _, domain in
                recordedDomain.setValue(domain)
            }
        }
        store.exhaustivity = .off

        await store.send(.auth(.presented(.delegate(.signedIn(uid: "new-authed-uid")))))
        await store.receive(\.studentsFetched)  // fallback fires with []
        await store.finish()

        XCTAssertEqual(recordedDomain.value, "firestore.fetchAllStudents")
        XCTAssertEqual(store.state.journey.studentId, FirestoreSchema.defaultStudentId,
            "On fetch failure we must still resolve to default and continue.")
    }

    // MARK: - OnboardingFeature

    func test_onboarding_swiftDataSaveFailure_recordsToCrashlytics() async {
        struct SaveError: Error {}
        let recordedDomain = Box<String?>(nil)

        let store = TestStore(
            initialState: OnboardingFeature.State()
        ) {
            OnboardingFeature()
        } withDependencies: {
            $0.database.saveProfile = { _ in throw SaveError() }
            $0.authClient.currentUserId = { nil }
            $0.crashlyticsClient.recordError = { _, domain in
                recordedDomain.setValue(domain)
            }
        }

        await store.send(.nameChanged("Maya")) { $0.childName = "Maya" }
        await store.send(.continueTapped)
        await store.receive(\.profileSaved)
        await store.receive(\.onboardingComplete)

        XCTAssertEqual(recordedDomain.value, "swiftdata.saveProfile")
    }

    func test_onboarding_firestoreSyncFailure_recordsToCrashlytics() async {
        struct SyncError: Error {}
        let recordedDomain = Box<String?>(nil)

        let store = TestStore(
            initialState: OnboardingFeature.State()
        ) {
            OnboardingFeature()
        } withDependencies: {
            $0.database.saveProfile = { _ in }
            $0.authClient.currentUserId = { "test-uid" }
            $0.firestoreClient.syncProfile = { _, _, _ in throw SyncError() }
            $0.crashlyticsClient.recordError = { _, domain in
                recordedDomain.setValue(domain)
            }
        }

        await store.send(.nameChanged("Maya")) { $0.childName = "Maya" }
        await store.send(.continueTapped)
        await store.receive(\.profileSaved)
        await store.receive(\.onboardingComplete)

        XCTAssertEqual(recordedDomain.value, "firestore.syncProfile")
    }

    // MARK: - JourneyFeature

    func test_journey_missionComplete_firestoreFailure_recordsBoth() async {
        struct SparksError: Error {}
        struct LessonError: Error {}
        let recordedDomains = Box<[String]>([])

        let store = TestStore(
            initialState: JourneyFeature.State(
                currentLevelIndex: 0,
                levels: [
                    LevelDefinition(id: "lit-1", title: "Short Vowel 'a'",
                                    category: .literacy, targetValue: "a", biome: .forest)
                ],
                studentId: "kid-A"
            )
        ) {
            JourneyFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.database.saveProgress = { _ in }
            $0.authClient.currentUserId = { "test-uid" }
            $0.firestoreClient.syncSparks = { _, _, _ in throw SparksError() }
            $0.firestoreClient.syncLesson = { _, _, _ in throw LessonError() }
            $0.crashlyticsClient.recordError = { _, domain in
                recordedDomains.withValue { $0.append(domain) }
            }
        }

        let level = LevelDefinition(id: "lit-1", title: "Short Vowel 'a'",
                                    category: .literacy, targetValue: "a", biome: .forest)
        await store.send(.missionComplete(level)) {
            $0.sparksCount = 10
            $0.currentLevelIndex = 1
            $0.missionComplete = MissionCompleteFeature.State(
                levelTitle: level.title,
                sparksAwarded: 10
            )
        }
        await store.finish()

        XCTAssertTrue(recordedDomains.value.contains("firestore.syncSparks"),
            "Failed sparks sync must record to Crashlytics.")
        XCTAssertTrue(recordedDomains.value.contains("firestore.syncLesson"),
            "Failed lesson sync must record to Crashlytics.")
    }
}
