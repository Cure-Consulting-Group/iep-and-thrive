import Foundation

/// A single module/lesson in the student journey map.
struct JourneyNode: Identifiable, Codable {
    let id: UUID
    let title: String
    let description: String
    let type: NodeType
    let status: NodeStatus
    let position: CGPoint // Coordinate on the scrolling map
    
    enum NodeType: String, Codable {
        case literacy = "LITERACY"
        case numeracy = "NUMERACY"
        case sel = "SEL"
        case reward = "REWARD"
    }
    
    enum NodeStatus: String, Codable {
        case locked = "LOCKED"
        case available = "AVAILABLE"
        case completed = "COMPLETED"
    }
}
