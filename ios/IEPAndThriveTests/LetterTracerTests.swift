import CoreGraphics
import XCTest
@testable import IEPAndThrive

/// Geometry tests for the Sand Tray's stroke validator. These guard the
/// SPED-forgiving thresholds (accuracy ≥ 0.55, coverage ≥ 0.45) that PR #15
/// shipped — they're the difference between "child made an effort" and
/// "child got rewarded for scribbling."
final class LetterTracerTests: XCTestCase {

    private let canvas = CGSize(width: 400, height: 400)

    func test_emptyStrokes_failBothChecks() {
        let tracer = LetterTracer(target: "a", canvasSize: canvas)
        let result = tracer.evaluate(strokes: [])

        XCTAssertEqual(result.accuracy, 0)
        XCTAssertEqual(result.coverage, 0)
        XCTAssertFalse(result.isPass)
    }

    func test_singleDot_passesAccuracyButFailsCoverage() {
        // A single point sitting inside the letter outline scores accuracy
        // = 1.0 but coverage well below 0.45 — most anchors are untouched.
        // This is the "child tapped once" case the coverage gate exists to
        // catch.
        let tracer = LetterTracer(target: "a", canvasSize: canvas)
        let center = CGPoint(x: canvas.width / 2, y: canvas.height / 2)

        let result = tracer.evaluate(strokes: [[center]])

        XCTAssertGreaterThan(result.accuracy, 0)
        XCTAssertLessThan(result.coverage, 0.45)
        XCTAssertFalse(result.isPass)
    }

    func test_strokeFarOutsideCanvas_failsAccuracy() {
        // Points way outside the letter outline collapse accuracy to 0.
        let tracer = LetterTracer(target: "a", canvasSize: canvas)
        let offCanvas = [
            CGPoint(x: -200, y: -200),
            CGPoint(x: -210, y: -210),
            CGPoint(x: -220, y: -220),
        ]

        let result = tracer.evaluate(strokes: [offCanvas])

        XCTAssertEqual(result.accuracy, 0)
        XCTAssertFalse(result.isPass)
    }

    func test_denseTraceAlongAnchors_passes() {
        // Simulate a real trace: walk along every anchor the tracer
        // sampled from the glyph outline. That guarantees accuracy = 1.0
        // (every point is on the path) and coverage = 1.0 (every anchor
        // is within tolerance of itself).
        let tracer = LetterTracer(target: "a", canvasSize: canvas)

        let result = tracer.evaluate(strokes: [tracer.anchors])

        XCTAssertGreaterThanOrEqual(result.accuracy, 0.55)
        XCTAssertGreaterThanOrEqual(result.coverage, 0.45)
        XCTAssertTrue(result.isPass, "A trace that visits every glyph anchor must pass")
    }

    func test_thresholdBoundary_justBelowPass() {
        // Pass only one anchor — coverage will be ~1/N, well under 0.45 for
        // any glyph with more than 3 anchors. This locks in the coverage
        // gate against accidental loosening.
        let tracer = LetterTracer(target: "a", canvasSize: canvas)
        guard let firstAnchor = tracer.anchors.first else {
            return XCTFail("Expected at least one anchor for letter 'a'")
        }

        let result = tracer.evaluate(strokes: [[firstAnchor]])

        XCTAssertEqual(result.accuracy, 1.0, accuracy: 0.001)
        XCTAssertLessThan(result.coverage, 0.45)
        XCTAssertFalse(result.isPass)
    }

    func test_resultEquatable() {
        let a = LetterTracer.Result(accuracy: 0.6, coverage: 0.5, isPass: true)
        let b = LetterTracer.Result(accuracy: 0.6, coverage: 0.5, isPass: true)
        let c = LetterTracer.Result(accuracy: 0.6, coverage: 0.4, isPass: false)

        XCTAssertEqual(a, b)
        XCTAssertNotEqual(a, c)
    }
}
