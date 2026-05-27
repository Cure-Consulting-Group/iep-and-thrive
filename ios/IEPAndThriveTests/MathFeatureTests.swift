import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class MathFeatureTests: XCTestCase {

    /// Level with a defined targetCount (5) — "Addition Fluency" / "Make 5".
    private let addLevel = LevelDefinition(
        id: "math-6", title: "Addition Fluency",
        category: .math, targetValue: "add", biome: .mountain
    )

    /// Level without a defined targetCount — falls back to "any placement".
    private let estimateLevel = LevelDefinition(
        id: "math-5", title: "Estimation",
        category: .math, targetValue: "estimate", biome: .mountain
    )

    func test_blocksChanged_updatesCount() async {
        let store = TestStore(initialState: MathFeature.State(level: addLevel)) {
            MathFeature()
        }

        await store.send(.blocksChanged(3)) { $0.currentCount = 3 }
        await store.send(.blocksChanged(5)) { $0.currentCount = 5 }
    }

    func test_checkAnswer_correctCount_marksCorrectWithoutHint() async {
        let store = TestStore(
            initialState: MathFeature.State(level: addLevel)
        ) {
            MathFeature()
        }

        await store.send(.blocksChanged(5)) { $0.currentCount = 5 }
        XCTAssertTrue(store.state.isCorrect)

        // .checkAnswerTapped on a correct tray must NOT surface the hint.
        // RootFeature is the one that pops the path and fires mission
        // complete — the Math reducer just stays silent on the happy path.
        await store.send(.checkAnswerTapped)
        XCTAssertFalse(store.state.showIncorrectHint)
    }

    func test_checkAnswer_incorrectCount_surfacesHint() async {
        let store = TestStore(
            initialState: MathFeature.State(level: addLevel)
        ) {
            MathFeature()
        }

        await store.send(.blocksChanged(3)) { $0.currentCount = 3 }
        XCTAssertFalse(store.state.isCorrect)

        await store.send(.checkAnswerTapped) {
            $0.showIncorrectHint = true
        }
    }

    func test_blocksChanged_toCorrect_dismissesActiveHint() async {
        // The "Almost! Add 2 more." hint should auto-dismiss once the
        // child reaches the right count — they don't need to be lectured
        // after the fact.
        let store = TestStore(
            initialState: MathFeature.State(level: addLevel)
        ) {
            MathFeature()
        }

        await store.send(.blocksChanged(3)) { $0.currentCount = 3 }
        await store.send(.checkAnswerTapped) { $0.showIncorrectHint = true }
        await store.send(.blocksChanged(5)) {
            $0.currentCount = 5
            $0.showIncorrectHint = false
        }
    }

    func test_dismissHint_clearsHintState() async {
        let store = TestStore(
            initialState: MathFeature.State(level: addLevel)
        ) {
            MathFeature()
        }

        await store.send(.blocksChanged(3)) { $0.currentCount = 3 }
        await store.send(.checkAnswerTapped) { $0.showIncorrectHint = true }
        await store.send(.dismissHint) { $0.showIncorrectHint = false }
    }

    func test_backTapped_doesNotMarkCorrect() async {
        // Critical regression guard — this is the PR #9 silent-correctness
        // bug for the math side. Tapping back must never imply success.
        let store = TestStore(
            initialState: MathFeature.State(level: addLevel)
        ) {
            MathFeature()
        }

        await store.send(.blocksChanged(2)) { $0.currentCount = 2 }
        XCTAssertFalse(store.state.isCorrect)

        await store.send(.backTapped)
        XCTAssertFalse(store.state.isCorrect)
        XCTAssertFalse(store.state.showIncorrectHint)
    }

    func test_levelWithoutTargetCount_anyPlacementCounts() async {
        // Estimation / rounding levels don't have a Snap Cubes goal yet,
        // so they fall back to "any cube placement passes". This locks
        // that fallback in.
        let store = TestStore(
            initialState: MathFeature.State(level: estimateLevel)
        ) {
            MathFeature()
        }

        XCTAssertNil(store.state.targetCount)
        XCTAssertFalse(store.state.isCorrect)

        await store.send(.blocksChanged(1)) { $0.currentCount = 1 }
        XCTAssertTrue(store.state.isCorrect,
            "Levels without targetCount must accept any cube as correct.")
    }

    func test_canCheck_gateBlocksEmptyTray() async {
        let store = TestStore(
            initialState: MathFeature.State(level: addLevel)
        ) {
            MathFeature()
        }

        XCTAssertFalse(store.state.canCheck)

        await store.send(.blocksChanged(1)) { $0.currentCount = 1 }
        XCTAssertTrue(store.state.canCheck)
    }
}
