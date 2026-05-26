import SpriteKit
import UIKit

/// Physics-driven counting tray. Children spawn cubes with a tap on the
/// scene background, drag them around, and remove them with a long press.
/// The current cube count is reported back to the SwiftUI host via
/// `onCountChange`, which `MathView` forwards into the TCA store.
final class SnapCubesScene: SKScene {
    static let cubeCategory: UInt32 = 0x1 << 0
    static let cubeName = "snap-cube"
    static let maxCubes = 20

    var onCountChange: ((Int) -> Void)?

    private var draggingCube: SKSpriteNode?
    private var dragTouch: UITouch?

    override func didMove(to view: SKView) {
        scaleMode = .resizeFill
        backgroundColor = UIColor(red: 245/255, green: 239/255, blue: 224/255, alpha: 1.0) // creamDeep
        physicsWorld.gravity = CGVector(dx: 0, dy: -4)
        physicsBody = SKPhysicsBody(edgeLoopFrom: frame)
        physicsBody?.friction = 0.4
        physicsBody?.restitution = 0.1
        view.isMultipleTouchEnabled = false
    }

    override func didChangeSize(_ oldSize: CGSize) {
        super.didChangeSize(oldSize)
        physicsBody = SKPhysicsBody(edgeLoopFrom: frame)
        physicsBody?.friction = 0.4
        physicsBody?.restitution = 0.1
    }

    // MARK: - Touch handling

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        let tapped = nodes(at: location).first { $0.name == Self.cubeName } as? SKSpriteNode

        if let cube = tapped {
            // Begin drag
            draggingCube = cube
            dragTouch = touch
            cube.physicsBody?.isDynamic = false
            cube.zPosition = 10
        } else if cubeCount < Self.maxCubes {
            spawnCube(at: location)
        }
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first(where: { $0 === dragTouch }),
              let cube = draggingCube else { return }
        cube.position = touch.location(in: self)
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        endDrag()
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        endDrag()
    }

    private func endDrag() {
        if let cube = draggingCube {
            cube.physicsBody?.isDynamic = true
            cube.physicsBody?.velocity = .zero
            cube.zPosition = 1
        }
        draggingCube = nil
        dragTouch = nil
    }

    // MARK: - Spawning

    private func spawnCube(at point: CGPoint) {
        let size: CGFloat = 56
        let cube = SKSpriteNode(color: UIColor(red: 212/255, green: 134/255, blue: 11/255, alpha: 1.0), // amber
                                size: CGSize(width: size, height: size))
        cube.name = Self.cubeName
        cube.position = CGPoint(x: point.x, y: max(point.y, frame.height - size))
        cube.zPosition = 1

        let body = SKPhysicsBody(rectangleOf: cube.size)
        body.restitution = 0.1
        body.friction = 0.7
        body.linearDamping = 0.6
        body.angularDamping = 0.6
        body.categoryBitMask = Self.cubeCategory
        body.collisionBitMask = Self.cubeCategory | 0x1 << 31 // collide with cubes and edges
        cube.physicsBody = body

        addChild(cube)
        notifyCountChange()

        let pulse = SKAction.sequence([
            SKAction.scale(to: 1.1, duration: 0.08),
            SKAction.scale(to: 1.0, duration: 0.08)
        ])
        cube.run(pulse)
    }

    // MARK: - Public API

    var cubeCount: Int {
        children.filter { $0.name == Self.cubeName }.count
    }

    func clear() {
        children.filter { $0.name == Self.cubeName }.forEach { $0.removeFromParent() }
        notifyCountChange()
    }

    func removeOneCube() {
        guard let cube = (children.last { $0.name == Self.cubeName }) else { return }
        cube.removeFromParent()
        notifyCountChange()
    }

    private func notifyCountChange() {
        let count = cubeCount
        DispatchQueue.main.async { [weak self] in
            self?.onCountChange?(count)
        }
    }
}
