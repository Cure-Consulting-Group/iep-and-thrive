import Foundation
import SwiftData

@Model
final class StudentProfile {
    var id: UUID
    var firstName: String
    var age: Int
    var primaryFocus: String // "reading", "math", "both"
    var createdAt: Date
    
    init(id: UUID = UUID(), firstName: String = "", age: Int = 6, primaryFocus: String = "reading", createdAt: Date = Date()) {
        self.id = id
        self.firstName = firstName
        self.age = age
        self.primaryFocus = primaryFocus
        self.createdAt = createdAt
    }
}

@Model
final class LessonProgress {
    var id: UUID
    var levelIndex: Int
    var category: String // "literacy", "math"
    var isCompleted: Bool
    var lastAttemptAt: Date
    var score: Int
    
    init(id: UUID = UUID(), levelIndex: Int, category: String, isCompleted: Bool = false, lastAttemptAt: Date = Date(), score: Int = 0) {
        self.id = id
        self.levelIndex = levelIndex
        self.category = category
        self.isCompleted = isCompleted
        self.lastAttemptAt = lastAttemptAt
        self.score = score
    }
}

@Model
final class SparksRecord {
    var id: UUID
    var amount: Int
    var reason: String // e.g., "lesson_complete", "daily_bonus"
    var earnedAt: Date
    
    init(id: UUID = UUID(), amount: Int, reason: String, earnedAt: Date = Date()) {
        self.id = id
        self.amount = amount
        self.reason = reason
        self.earnedAt = earnedAt
    }
}
