import CoreGraphics
import CoreText
import Foundation
import UIKit

/// Evaluates whether a child's freeform drawing in the Sand Tray actually
/// traced the target letter, vs. random scribbling.
///
/// The check is intentionally forgiving — these are SPED students learning
/// motor skills, not handwriting graders. Two metrics, both must pass:
///
/// 1. **Accuracy** — what fraction of user stroke points fall inside the
///    inflated letter outline (the letter shape thickened by `tolerance`).
/// 2. **Coverage** — what fraction of the letter outline's sample anchors
///    have a user stroke point within `tolerance` of them.
///
/// A user who scribbles outside the letter fails accuracy; a user who
/// draws a single dot fails coverage. Tracing roughly along the ghost
/// letter passes both.
struct LetterTracer {
    let target: String
    let canvasSize: CGSize
    let fontPointSize: CGFloat
    let tolerance: CGFloat

    private let inflatedPath: CGPath
    private let anchors: [CGPoint]

    init(target: String, canvasSize: CGSize, fontPointSize: CGFloat = 300, tolerance: CGFloat = 40) {
        self.target = target
        self.canvasSize = canvasSize
        self.fontPointSize = fontPointSize
        self.tolerance = tolerance

        let outline = Self.makeLetterPath(
            text: target,
            canvasSize: canvasSize,
            fontPointSize: fontPointSize
        )
        self.inflatedPath = outline.copy(
            strokingWithWidth: tolerance * 2,
            lineCap: .round,
            lineJoin: .round,
            miterLimit: 1
        )
        self.anchors = Self.sampleAnchors(from: outline)
    }

    struct Result: Equatable {
        let accuracy: Double  // 0...1, fraction of user points inside the inflated letter
        let coverage: Double  // 0...1, fraction of letter anchors touched
        let isPass: Bool
    }

    func evaluate(strokes: [[CGPoint]]) -> Result {
        let userPoints = strokes.flatMap { $0 }
        guard !userPoints.isEmpty, !anchors.isEmpty else {
            return Result(accuracy: 0, coverage: 0, isPass: false)
        }

        var insideCount = 0
        for point in userPoints where inflatedPath.contains(point) {
            insideCount += 1
        }
        let accuracy = Double(insideCount) / Double(userPoints.count)

        let r2 = tolerance * tolerance
        var hitAnchors = 0
        for anchor in anchors {
            for point in userPoints {
                let dx = anchor.x - point.x
                let dy = anchor.y - point.y
                if dx * dx + dy * dy <= r2 {
                    hitAnchors += 1
                    break
                }
            }
        }
        let coverage = Double(hitAnchors) / Double(anchors.count)

        let isPass = accuracy >= 0.55 && coverage >= 0.45
        return Result(accuracy: accuracy, coverage: coverage, isPass: isPass)
    }

    // MARK: - Path construction

    private static func makeLetterPath(text: String, canvasSize: CGSize, fontPointSize: CGFloat) -> CGPath {
        let font = UIFont.systemFont(ofSize: fontPointSize, weight: .thin)
        let attr = NSAttributedString(string: text, attributes: [.font: font])
        let line = CTLineCreateWithAttributedString(attr)
        let runs = CTLineGetGlyphRuns(line) as! [CTRun]

        let glyphPath = CGMutablePath()
        for run in runs {
            let count = CTRunGetGlyphCount(run)
            guard count > 0 else { continue }

            let attrs = CTRunGetAttributes(run) as! [CFString: Any]
            guard let ctFont = attrs[kCTFontAttributeName] as! CTFont? else { continue }

            var glyphs = [CGGlyph](repeating: 0, count: count)
            var positions = [CGPoint](repeating: .zero, count: count)
            CTRunGetGlyphs(run, CFRange(location: 0, length: count), &glyphs)
            CTRunGetPositions(run, CFRange(location: 0, length: count), &positions)

            for i in 0..<count {
                if let perGlyph = CTFontCreatePathForGlyph(ctFont, glyphs[i], nil) {
                    var transform = CGAffineTransform(translationX: positions[i].x, y: positions[i].y)
                    glyphPath.addPath(perGlyph, transform: transform)
                }
            }
        }

        // CoreText returns paths in y-up coordinates. Flip into UIKit y-down,
        // then center inside the canvas.
        let bbox = glyphPath.boundingBox
        var flip = CGAffineTransform(scaleX: 1, y: -1)
            .translatedBy(x: -bbox.minX, y: -bbox.maxY)
        guard let flipped = glyphPath.copy(using: &flip) else { return glyphPath }

        let normBBox = flipped.boundingBox
        let dx = (canvasSize.width  - normBBox.width)  / 2 - normBBox.minX
        let dy = (canvasSize.height - normBBox.height) / 2 - normBBox.minY
        var center = CGAffineTransform(translationX: dx, y: dy)
        return flipped.copy(using: &center) ?? flipped
    }

    /// Sample points along the outline. Curves contribute their control
    /// points plus their endpoint — fine-grained enough to validate with
    /// a `tolerance`-radius neighborhood.
    private static func sampleAnchors(from path: CGPath) -> [CGPoint] {
        var points: [CGPoint] = []
        path.applyWithBlock { elementPtr in
            let element = elementPtr.pointee
            switch element.type {
            case .moveToPoint, .addLineToPoint:
                points.append(element.points[0])
            case .addQuadCurveToPoint:
                points.append(element.points[0])
                points.append(element.points[1])
            case .addCurveToPoint:
                points.append(element.points[0])
                points.append(element.points[1])
                points.append(element.points[2])
            case .closeSubpath:
                break
            @unknown default:
                break
            }
        }
        return points
    }
}
