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

    // MARK: - Onboarding → Paywall

    func test_onboardingComplete_marksOnboardedAndPresentsPaywall() async {
        let store = TestStore(initialState: RootFeature.State()) {
            RootFeature()
        }

        await store.send(.onboarding(.onboardingComplete)) {
            $0.isUserOnboarded = true
            $0.paywall = PaywallFeature.State()
        }
    }

    func test_onboardingComplete_doesNotShowPaywall_whenAlreadyPremium() async {
        var initial = RootFeature.State()
        initial.isPremium = true

        let store = TestStore(initialState: initial) {
            RootFeature()
        }

        await store.send(.onboarding(.onboardingComplete)) {
            $0.isUserOnboarded = true
        }
        XCTAssertNil(store.state.paywall)
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
            $0.database.addSparks = { _, _ in }
        }

        let id = initial.path.ids.last!
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

        let id = initial.path.ids.last!
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
            $0.database.addSparks = { _, _ in }
        }

        let id = initial.path.ids.last!
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

        let id = initial.path.ids.last!
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

        let id = initial.path.ids.last!
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

        let id = initial.path.ids.last!
        await store.send(.path(.element(id: id, action: .safeSpace(.exitTapped)))) {
            $0.path.removeLast()
        }
        await store.finish()
    }
}
