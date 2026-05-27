import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class LiteracyFeatureTests: XCTestCase {

    private let level = LevelDefinition(
        id: "lit-1", title: "Short Vowel 'a'",
        category: .literacy, targetValue: "a", biome: .forest
    )

    func test_onAppear_speaksTargetLetter() async {
        let spoken = Box<String?>(nil)
        let store = TestStore(
            initialState: LiteracyFeature.State(level: level)
        ) {
            LiteracyFeature()
        } withDependencies: {
            $0[SpeechClient.self] = SpeechClient(speak: { text in
                spoken.setValue(text)
            })
        }

        await store.send(.onAppear)
        await store.finish()
        XCTAssertEqual(spoken.value, "a")
    }

    func test_speakLetterTapped_repeatsLetter() async {
        let callCount = Box(0)
        let store = TestStore(
            initialState: LiteracyFeature.State(level: level)
        ) {
            LiteracyFeature()
        } withDependencies: {
            $0[SpeechClient.self] = SpeechClient(speak: { _ in
                callCount.withValue { $0 += 1 }
            })
        }

        await store.send(.speakLetterTapped)
        await store.finish()
        XCTAssertEqual(callCount.value, 1)
    }

    func test_tracingEnded_success_marksCompleteAndClearsHint() async {
        let store = TestStore(
            initialState: LiteracyFeature.State(level: level)
        ) {
            LiteracyFeature()
        }

        await store.send(.tracingEnded(true)) {
            $0.isTracingComplete = true
            $0.showTraceHint = false
        }
    }

    func test_tracingEnded_failure_surfacesHintWithoutCompleting() async {
        let store = TestStore(
            initialState: LiteracyFeature.State(level: level)
        ) {
            LiteracyFeature()
        }

        await store.send(.tracingEnded(false)) {
            $0.isTracingComplete = false
            $0.showTraceHint = true
        }
    }

    func test_doneTapped_doesNotMutateLiteracyState() async {
        // doneTapped is consumed by RootFeature (pops path, awards mission
        // complete). The Literacy reducer itself must not flip state —
        // otherwise we'd double-award or get an inconsistent view.
        let store = TestStore(
            initialState: LiteracyFeature.State(level: level)
        ) {
            LiteracyFeature()
        }

        await store.send(.doneTapped)
    }

    func test_backTapped_doesNotMarkComplete() async {
        // Regression guard for the PR #9 silent-correctness bug: tapping
        // back chevron must NOT flip isTracingComplete or surface a hint.
        let store = TestStore(
            initialState: LiteracyFeature.State(level: level)
        ) {
            LiteracyFeature()
        }

        await store.send(.backTapped)
        XCTAssertFalse(store.state.isTracingComplete)
        XCTAssertFalse(store.state.showTraceHint)
    }
}
