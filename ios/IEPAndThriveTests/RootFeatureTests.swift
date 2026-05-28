import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class RootFeatureTests: XCTestCase {

    private let literacyLevel = LevelDefinition(
        id: "lit-1", title: "Short Vowel 'a'",
        category: .literacy, targetValue: "a", biome: .forest
    )

    private let mathLevel = LevelDefinition(
        id: "math-6", title: "Addition Fluency",
        category: .math, targetValue: "add", biome: .mountain
    )

    // MARK: - Auth bootstrap

    func test_didFinishLaunching_resolvesAnonymousAuth() async {
        // Phase 1 of Firebase sync: anonymous Firebase Auth runs first on
        // launch so the UID is available before any Firestore writes.
        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        } withDependencies: {
            $0.authClient.signInAnonymously = { "anon-uid-123" }
            $0.database.fetchProfile = { nil }
            // Finish the subscription stream immediately so the .run
            // effect completes within the test — the live stream is
            // long-lived but tests don't exercise subscription updates.
            $0.storeKit.observeStatus = {
                AsyncStream { $0.finish() }
            }
        }

        await store.send(.appDelegate(.didFinishLaunching))
        await store.receive(\.authResolved) {
            $0.currentUid = "anon-uid-123"
        }
        await store.receive(\.profileLoaded)
        await store.finish()
    }

    // MARK: - Auth modal + anon→authenticated migration

    func test_onboardingSignInTapped_presentsAuthSheet() async {
        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        }

        await store.send(.onboarding(.signInTapped)) {
            $0.auth = AuthFeature.State()
        }
    }

    func test_authSignedIn_zeroExistingStudents_autoMigratesToDefault() async {
        // 2.4 flow: after signedIn, RootFeature fetches the parent's
        // students. With 0 existing students, we auto-migrate the anon
        // data to users/{authed}/students/default and proceed — no
        // picker UI shown.
        let migrateCall = Box<(String, String, String)?>(nil)

        var initial = RootFeature.State()
        initial.currentUid = "anon-uid"
        initial.auth = AuthFeature.State()

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { _ in [] }
            $0.firestoreClient.migrateAnonData = { anon, authed, target in
                migrateCall.setValue((anon, authed, target))
            }
        }
        store.exhaustivity = .off

        await store.send(.auth(.presented(.delegate(.signedIn(uid: "new-authed-uid")))))
        await store.receive(\.studentsFetched)
        await store.finish()

        XCTAssertEqual(store.state.currentUid, "new-authed-uid")
        XCTAssertEqual(store.state.journey.studentId, FirestoreSchema.defaultStudentId)
        XCTAssertNil(store.state.childPicker,
            "0 students must not present the child picker.")
        XCTAssertEqual(migrateCall.value?.0, "anon-uid")
        XCTAssertEqual(migrateCall.value?.1, "new-authed-uid")
        XCTAssertEqual(migrateCall.value?.2, FirestoreSchema.defaultStudentId)
    }

    func test_authSignedIn_oneExistingStudent_autoMigratesToThatStudent() async {
        // 2.4: exactly 1 existing student → auto-select that student,
        // no picker UI shown.
        let migrateCall = Box<(String, String, String)?>(nil)
        let existing = StudentSummaryDTO(id: "kid-A", firstName: "Aiden", age: 8, createdAt: nil)

        var initial = RootFeature.State()
        initial.currentUid = "anon-uid"
        initial.auth = AuthFeature.State()

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { _ in [existing] }
            $0.firestoreClient.migrateAnonData = { anon, authed, target in
                migrateCall.setValue((anon, authed, target))
            }
        }
        store.exhaustivity = .off

        await store.send(.auth(.presented(.delegate(.signedIn(uid: "new-authed-uid")))))
        await store.receive(\.studentsFetched)
        await store.finish()

        XCTAssertEqual(store.state.journey.studentId, "kid-A")
        XCTAssertNil(store.state.childPicker)
        XCTAssertEqual(migrateCall.value?.2, "kid-A")
    }

    func test_authSignedIn_multipleStudents_opensPicker() async {
        // 2+ students → present the picker, do NOT migrate yet.
        let migrateCalled = Box(false)
        let students = [
            StudentSummaryDTO(id: "kid-A", firstName: "Aiden", age: 8, createdAt: nil),
            StudentSummaryDTO(id: "kid-B", firstName: "Maya", age: 6, createdAt: nil)
        ]

        var initial = RootFeature.State()
        initial.currentUid = "anon-uid"
        initial.auth = AuthFeature.State()

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { _ in students }
            $0.firestoreClient.migrateAnonData = { _, _, _ in
                migrateCalled.setValue(true)
            }
        }
        store.exhaustivity = .off

        await store.send(.auth(.presented(.delegate(.signedIn(uid: "new-authed-uid")))))
        await store.receive(\.studentsFetched)
        await store.finish()

        XCTAssertNotNil(store.state.childPicker,
            "2+ students must present the child picker.")
        XCTAssertEqual(store.state.childPicker?.students.count, 2)
        XCTAssertEqual(store.state.pendingMigrationFromUid, "anon-uid",
            "Anon UID must be held for the picker delegate to consume.")
        XCTAssertFalse(migrateCalled.value,
            "Migration must wait for picker resolution, not fire on fetch.")
    }

    func test_childPicker_studentSelected_migratesToPicked() async {
        let migrateCall = Box<(String, String, String)?>(nil)

        var initial = RootFeature.State()
        initial.currentUid = "new-authed-uid"
        initial.pendingMigrationFromUid = "anon-uid"
        initial.childPicker = ChildPickerFeature.State(
            uid: "new-authed-uid",
            students: [StudentSummaryDTO(id: "kid-A", firstName: "Aiden", age: 8, createdAt: nil)]
        )

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.migrateAnonData = { anon, authed, target in
                migrateCall.setValue((anon, authed, target))
            }
        }
        store.exhaustivity = .off

        await store.send(.childPicker(.presented(.delegate(.studentSelected(id: "kid-A")))))
        await store.finish()

        XCTAssertEqual(store.state.journey.studentId, "kid-A")
        XCTAssertNil(store.state.pendingMigrationFromUid,
            "pendingMigrationFromUid must clear after migration runs.")
        XCTAssertEqual(migrateCall.value?.0, "anon-uid")
        XCTAssertEqual(migrateCall.value?.1, "new-authed-uid")
        XCTAssertEqual(migrateCall.value?.2, "kid-A")
    }

    func test_childPicker_createNewStudent_migratesToFreshUuid() async {
        let migrateCall = Box<(String, String, String)?>(nil)

        var initial = RootFeature.State()
        initial.currentUid = "new-authed-uid"
        initial.pendingMigrationFromUid = "anon-uid"
        initial.childPicker = ChildPickerFeature.State(uid: "new-authed-uid")

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.firestoreClient.migrateAnonData = { anon, authed, target in
                migrateCall.setValue((anon, authed, target))
            }
        }
        store.exhaustivity = .off

        await store.send(.childPicker(.presented(.delegate(.createNewStudent))))
        await store.finish()

        XCTAssertNotNil(UUID(uuidString: store.state.journey.studentId),
            "Create-new path must mint a fresh UUID for journey.studentId.")
        XCTAssertEqual(migrateCall.value?.2, store.state.journey.studentId,
            "Migration target must be the freshly-minted UUID.")
    }

    // MARK: - Onboarding → no auto-paywall (Phase 3.4 deferred it)

    func test_onboardingComplete_marksOnboardedButDoesNotPresentPaywall() async {
        // Phase 3.4 defers the paywall to after 3 missions. Onboarding
        // complete just marks the flag — paywall stays nil.
        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        }

        await store.send(.onboarding(.onboardingComplete)) {
            $0.isUserOnboarded = true
        }
        XCTAssertNil(store.state.paywall,
            "Paywall must not auto-present after onboarding — Phase 3.4 deferred this.")
    }

    func test_profileLoaded_doesNotPresentPaywall() async {
        // Same deferral applies to the launch flow when a returning
        // user's profile loads.
        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        }

        let profile = StudentProfile(firstName: "Aiden", age: 8, primaryFocus: "reading")
        await store.send(.profileLoaded(profile)) {
            $0.isUserOnboarded = true
        }
        XCTAssertNil(store.state.paywall)
    }

    // MARK: - Paywall gated on mission count

    func test_paywall_presentsAfterThirdMission() async {
        // 3 missions × 10 sparks = 30. Below threshold no paywall;
        // crossing it presents the paywall and flips the one-shot guard.
        var initial = RootFeature.State()
        initial.journey.currentLevelIndex = 2  // already completed 2 missions worth
        initial.journey.sparksCount = 20

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.database.saveProgress = { _ in }
            $0.authClient.currentUserId = { nil }
        }
        // The journey reducer fires its own effects (database/firestore)
        // — exhaustively asserting all of them isn't the point of this
        // test, we care about the paywall gate.
        store.exhaustivity = .off

        let level = LevelDefinition(id: "lit-1", title: "x", category: .literacy,
                                    targetValue: "a", biome: .forest)
        await store.send(.journey(.missionComplete(level)))
        await store.finish()

        XCTAssertEqual(store.state.journey.sparksCount, 30)
        XCTAssertNotNil(store.state.paywall,
            "Crossing the 30-spark threshold must present the paywall.")
        XCTAssertTrue(store.state.hasShownPaywallThisSession)
    }

    func test_paywall_doesNotPresentBeforeThirdMission() async {
        var initial = RootFeature.State()
        initial.journey.sparksCount = 10  // already 1 mission in

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.database.saveProgress = { _ in }
            $0.authClient.currentUserId = { nil }
        }
        store.exhaustivity = .off

        let level = LevelDefinition(id: "lit-1", title: "x", category: .literacy,
                                    targetValue: "a", biome: .forest)
        await store.send(.journey(.missionComplete(level)))
        await store.finish()

        XCTAssertEqual(store.state.journey.sparksCount, 20)
        XCTAssertNil(store.state.paywall,
            "Two completed missions must NOT present the paywall yet.")
    }

    func test_paywall_skipsRePresentOnSubsequentMissions() async {
        // Once the paywall has shown this session and the parent
        // dismissed it, hitting 4+ missions must not re-present.
        var initial = RootFeature.State()
        initial.journey.sparksCount = 30
        initial.hasShownPaywallThisSession = true

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.database.saveProgress = { _ in }
            $0.authClient.currentUserId = { nil }
        }
        store.exhaustivity = .off

        let level = LevelDefinition(id: "lit-1", title: "x", category: .literacy,
                                    targetValue: "a", biome: .forest)
        await store.send(.journey(.missionComplete(level)))
        await store.finish()

        XCTAssertNil(store.state.paywall,
            "Paywall must remain dismissed for the rest of the session after first present.")
    }

    func test_paywall_skipsWhenPremium() async {
        var initial = RootFeature.State()
        initial.isPremium = true
        initial.journey.sparksCount = 30

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
            $0.database.saveProgress = { _ in }
            $0.authClient.currentUserId = { nil }
        }
        store.exhaustivity = .off

        let level = LevelDefinition(id: "lit-1", title: "x", category: .literacy,
                                    targetValue: "a", biome: .forest)
        await store.send(.journey(.missionComplete(level)))
        await store.finish()

        XCTAssertNil(store.state.paywall,
            "Premium parents must never see the paywall regardless of spark count.")
    }

    // MARK: - Settings + sign-out

    func test_journeySettingsTapped_opensSettingsSheet() async {
        var initial = RootFeature.State()
        initial.currentUid = "test-uid-123"

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        await store.send(.journey(.settingsTapped)) {
            $0.settings = SettingsFeature.State(uid: "test-uid-123")
        }
    }

    func test_settingsSignedOut_resetsStateAndRestartsAnonAuth() async {
        // The user tapped Sign Out and SettingsFeature confirmed via
        // delegate. RootFeature must clear currentUid, reset student
        // routing to default, and fire a new anonymous sign-in so the
        // child can keep using the device against a fresh UID.
        var initial = RootFeature.State()
        initial.currentUid = "authed-uid"
        initial.journey.studentId = "kid-A"
        initial.hasShownPaywallThisSession = true
        initial.settings = SettingsFeature.State(uid: "authed-uid")

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.authClient.signInAnonymously = { "fresh-anon-uid" }
        }
        store.exhaustivity = .off

        await store.send(.settings(.presented(.delegate(.signedOut)))) {
            $0.currentUid = nil
            $0.journey.studentId = FirestoreSchema.defaultStudentId
            $0.pendingMigrationFromUid = nil
            $0.hasShownPaywallThisSession = false
        }
        await store.receive(\.authResolved) {
            $0.currentUid = "fresh-anon-uid"
        }
        await store.finish()
    }

    func test_subscriptionStatusChanged_toPremium_dismissesPaywall() async {
        var initial = RootFeature.State()
        initial.paywall = PaywallFeature.State()

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        await store.send(.subscriptionStatusChanged(true)) {
            $0.isPremium = true
            $0.paywall = nil
        }
    }

    // MARK: - Journey → Path navigation

    func test_levelPreview_startLiteracy_pushesLiteracyPath() async {
        var initial = RootFeature.State()
        initial.journey.levelPreview = LevelPreviewFeature.State(level: literacyLevel)

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        let level = literacyLevel
        await store.send(.journey(.levelPreview(.presented(.startButtonTapped(level))))) {
            $0.journey.levelPreview = nil
            $0.path.append(.literacy(LiteracyFeature.State(level: level)))
        }
    }

    func test_levelPreview_startMath_pushesMathPath() async {
        var initial = RootFeature.State()
        initial.journey.levelPreview = LevelPreviewFeature.State(level: mathLevel)

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        let level = mathLevel
        await store.send(.journey(.levelPreview(.presented(.startButtonTapped(level))))) {
            $0.journey.levelPreview = nil
            $0.path.append(.math(MathFeature.State(level: level)))
        }
    }

    func test_safeSpaceTapped_pushesSafeSpacePath() async {
        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        }

        await store.send(.journey(.safeSpaceTapped)) {
            $0.path.append(.safeSpace(SafeSpaceFeature.State()))
        }
    }

    // MARK: - Path completion + regression guards

    func test_literacyDone_popsPathAndAwardsMission() async {
        var initial = RootFeature.State()
        initial.path.append(.literacy(LiteracyFeature.State(level: literacyLevel)))

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
        }

        // StackElementID conforms to ExpressibleByIntegerLiteral in tests;
        // pushing the first element gives it id 0.
        let id: StackElementID = 0
        await store.send(.path(.element(id: id, action: .literacy(.doneTapped)))) {
            $0.path.removeLast()
        }
        // The journey reducer awards 10 sparks and presents the mission
        // complete sheet. currentLevelIndex does NOT advance here because
        // state.levels is empty (we didn't load the curriculum) — the
        // index gate `levels.firstIndex(of: level) == currentLevelIndex`
        // returns nil and short-circuits. JourneyFeatureTests covers the
        // advance path with seeded levels.
        await store.receive(\.journey.missionComplete) {
            $0.journey.sparksCount = 10
            $0.journey.missionComplete = MissionCompleteFeature.State(
                levelTitle: self.literacyLevel.title,
                sparksAwarded: 10
            )
        }
        await store.finish()
    }

    func test_literacyBack_popsPathWithoutAwardingMission() async {
        // The PR #9 silent-correctness regression: tapping back must pop
        // the screen WITHOUT firing journey.missionComplete. If this test
        // ever sees an unexpected missionComplete action, TCA's TestStore
        // fails the test.
        var initial = RootFeature.State()
        initial.path.append(.literacy(LiteracyFeature.State(level: literacyLevel)))

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        // StackElementID conforms to ExpressibleByIntegerLiteral in tests;
        // pushing the first element gives it id 0.
        let id: StackElementID = 0
        await store.send(.path(.element(id: id, action: .literacy(.backTapped)))) {
            $0.path.removeLast()
        }
        // No .receive() call — the test fails if any unhandled action fires.
        await store.finish()
        XCTAssertEqual(store.state.journey.sparksCount, 0)
        XCTAssertNil(store.state.journey.missionComplete)
    }

    func test_mathCheck_correctCount_popsAndAwardsMission() async {
        var mathState = MathFeature.State(level: mathLevel)
        mathState.currentCount = 5  // matches targetCount(5) for "add"
        XCTAssertTrue(mathState.isCorrect)

        var initial = RootFeature.State()
        initial.path.append(.math(mathState))

        let store = TestStore(initialState: initial) {
            RootFeature()
        } withDependencies: {
            $0.database.addSparks = { _ in }
        }

        // StackElementID conforms to ExpressibleByIntegerLiteral in tests;
        // pushing the first element gives it id 0.
        let id: StackElementID = 0
        await store.send(.path(.element(id: id, action: .math(.checkAnswerTapped)))) {
            $0.path.removeLast()
        }
        await store.receive(\.journey.missionComplete) {
            $0.journey.sparksCount = 10
            $0.journey.missionComplete = MissionCompleteFeature.State(
                levelTitle: self.mathLevel.title,
                sparksAwarded: 10
            )
        }
        await store.finish()
    }

    func test_mathCheck_incorrectCount_doesNotPopOrAward() async {
        // The Math reducer surfaces the hint locally; RootFeature must NOT
        // pop the path or fire missionComplete. This was the PR #9 fix —
        // before, .checkAnswerTapped unconditionally completed.
        var mathState = MathFeature.State(level: mathLevel)
        mathState.currentCount = 2  // does NOT match targetCount(5)
        XCTAssertFalse(mathState.isCorrect)

        var initial = RootFeature.State()
        initial.path.append(.math(mathState))

        let store = TestStore(initialState: initial) {
            RootFeature()
        }
        // The Math reducer flips its own showIncorrectHint state when
        // .checkAnswerTapped fires on an incorrect tray. We don't care
        // about that nested flip here — the Math reducer's tests cover
        // it. We only care about RootFeature's routing decision.
        store.exhaustivity = .off

        // StackElementID conforms to ExpressibleByIntegerLiteral in tests;
        // pushing the first element gives it id 0.
        let id: StackElementID = 0
        await store.send(.path(.element(id: id, action: .math(.checkAnswerTapped))))
        await store.finish()

        XCTAssertEqual(store.state.path.count, 1,
            "Incorrect math answer must NOT pop the path.")
        XCTAssertEqual(store.state.journey.sparksCount, 0,
            "Incorrect math answer must NOT award sparks.")
        XCTAssertNil(store.state.journey.missionComplete,
            "Incorrect math answer must NOT present the mission complete sheet.")
    }

    func test_mathBack_popsPathWithoutAwardingMission() async {
        var mathState = MathFeature.State(level: mathLevel)
        mathState.currentCount = 5  // would be "correct" — back must still NOT award
        var initial = RootFeature.State()
        initial.path.append(.math(mathState))

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        // StackElementID conforms to ExpressibleByIntegerLiteral in tests;
        // pushing the first element gives it id 0.
        let id: StackElementID = 0
        await store.send(.path(.element(id: id, action: .math(.backTapped)))) {
            $0.path.removeLast()
        }
        await store.finish()
        XCTAssertEqual(store.state.journey.sparksCount, 0)
    }

    func test_safeSpaceExit_popsPath() async {
        // The PR #9 fix for the dead Exit button. SafeSpace.exitTapped
        // must reach RootFeature and pop the path.
        var initial = RootFeature.State()
        initial.path.append(.safeSpace(SafeSpaceFeature.State()))

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        // StackElementID conforms to ExpressibleByIntegerLiteral in tests;
        // pushing the first element gives it id 0.
        let id: StackElementID = 0
        await store.send(.path(.element(id: id, action: .safeSpace(.exitTapped)))) {
            $0.path.removeLast()
        }
        await store.finish()
    }
}
