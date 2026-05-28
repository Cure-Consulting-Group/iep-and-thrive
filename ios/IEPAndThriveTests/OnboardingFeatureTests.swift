import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class OnboardingFeatureTests: XCTestCase {

    func test_nameChanged_updatesStateAndUnlocksContinue() async {
        let store = TestStore(initialState: OnboardingFeature.State()) {
            OnboardingFeature()
        }

        await store.send(.nameChanged("Aiden")) {
            $0.childName = "Aiden"
        }

        XCTAssertTrue(store.state.canContinue)
    }

    func test_continueDisabled_whenNameIsWhitespaceOnly() async {
        let store = TestStore(initialState: OnboardingFeature.State()) {
            OnboardingFeature()
        }

        await store.send(.nameChanged("   ")) {
            $0.childName = "   "
        }

        XCTAssertFalse(store.state.canContinue,
            "Trimmed-empty names must not unlock Continue — that's the gate PR #13 added.")
    }

    func test_continueTapped_withEmptyName_isNoOp() async {
        let store = TestStore(initialState: OnboardingFeature.State()) {
            OnboardingFeature()
        }
        store.dependencies.database.saveProfile = { _ in
            XCTFail("Profile must not be saved when name is empty")
        }

        // No state change expected, and no effect should fire.
        await store.send(.continueTapped)
    }

    func test_ageAndFocus_persist() async {
        let store = TestStore(initialState: OnboardingFeature.State()) {
            OnboardingFeature()
        }

        await store.send(.ageSelected(9)) { $0.age = 9 }
        await store.send(.focusSelected(.math)) { $0.primaryFocus = .math }
    }

    func test_continueTapped_savesProfileAndCompletes() async {
        let saved = Box<StudentProfile?>(nil)
        let firestoreSync = Box<(String, String, StudentProfileDTO)?>(nil)

        let store = TestStore(
            initialState: OnboardingFeature.State()
        ) {
            OnboardingFeature()
        } withDependencies: {
            $0.database.saveProfile = { profile in saved.setValue(profile) }
            $0.authClient.currentUserId = { "test-uid" }
            $0.firestoreClient.syncProfile = { uid, studentId, dto in
                firestoreSync.setValue((uid, studentId, dto))
            }
        }

        await store.send(.nameChanged("Maya")) { $0.childName = "Maya" }
        await store.send(.ageSelected(8)) { $0.age = 8 }
        await store.send(.focusSelected(.both)) { $0.primaryFocus = .both }

        await store.send(.continueTapped)
        await store.receive(\.profileSaved)
        await store.receive(\.onboardingComplete)

        let profile = saved.value
        XCTAssertEqual(profile?.firstName, "Maya")
        XCTAssertEqual(profile?.age, 8)
        XCTAssertEqual(profile?.primaryFocus, "both")
        // Same write should have reached Firestore with the same UUID,
        // at the anon-default student path.
        XCTAssertEqual(firestoreSync.value?.0, "test-uid")
        XCTAssertEqual(firestoreSync.value?.1, FirestoreSchema.defaultStudentId)
        XCTAssertEqual(firestoreSync.value?.2.firstName, "Maya")
        XCTAssertEqual(firestoreSync.value?.2.id, profile?.id)
    }

    func test_continueTapped_skipsFirestoreSync_whenNotAuthenticated() async {
        // If anonymous auth hasn't resolved yet (network blip on launch),
        // the local save still completes — the next foreground will
        // pick up the queued state. We must not crash when uid is nil.
        let firestoreSync = Box<Bool>(false)

        let store = TestStore(
            initialState: OnboardingFeature.State()
        ) {
            OnboardingFeature()
        } withDependencies: {
            $0.database.saveProfile = { _ in }
            $0.authClient.currentUserId = { nil }
            $0.firestoreClient.syncProfile = { _, _, _ in
                firestoreSync.setValue(true)
            }
        }

        await store.send(.nameChanged("Aiden")) { $0.childName = "Aiden" }
        await store.send(.continueTapped)
        await store.receive(\.profileSaved)
        await store.receive(\.onboardingComplete)

        XCTAssertFalse(firestoreSync.value,
            "Firestore sync must be skipped when there is no authenticated UID.")
    }

    func test_continueTapped_trimsWhitespaceBeforeSaving() async {
        let saved = Box<StudentProfile?>(nil)

        let store = TestStore(
            initialState: OnboardingFeature.State()
        ) {
            OnboardingFeature()
        } withDependencies: {
            $0.database.saveProfile = { profile in saved.setValue(profile) }
        }

        await store.send(.nameChanged("  Aiden  ")) { $0.childName = "  Aiden  " }
        await store.send(.continueTapped)
        await store.receive(\.profileSaved)
        await store.receive(\.onboardingComplete)

        XCTAssertEqual(saved.value?.firstName, "Aiden",
            "Saved profile must use trimmed name, not the raw text field.")
    }
}
