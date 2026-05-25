import SwiftUI
import Observation

@Observable
@MainActor
class JourneyViewModel {
    var nodes: [JourneyNode] = []
    var isLoading = false
    
    init() {
        self.nodes = [
            JourneyNode(
                id: UUID(),
                title: "Vowel Teams",
                description: "Mastering 'ai' and 'ay' vowel sounds.",
                type: .literacy,
                status: .available,
                position: CGPoint(x: 100, y: 100)
            ),
            JourneyNode(
                id: UUID(),
                title: "Counting Blocks",
                description: "Visual addition using snap cubes.",
                type: .numeracy,
                status: .locked,
                position: CGPoint(x: 200, y: 300)
            )
        ]
    }
    
    func selectNode(_ node: JourneyNode) {
        print("Selected node: \(node.title)")
    }
}
