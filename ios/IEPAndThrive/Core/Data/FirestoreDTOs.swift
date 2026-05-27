import Foundation

/// Codable shapes that get serialized to Firestore. Mirror SwiftData
/// `@Model` classes one-for-one — kept separate because `@Model` types
/// don't synthesize `Codable` cleanly, and mixing SwiftData persistence
/// concerns with the Firestore wire format makes both harder to evolve.
///
/// Phase 1 path scheme (anonymous UID):
///   users/{uid}/students/{studentId}/profile           — single doc
///   users/{uid}/students/{studentId}/lessons/{id}      — one per attempt
///   users/{uid}/students/{studentId}/sparks/{id}       — one per award
///
/// `studentId` for the device-bound Phase 1 case is the constant
/// `defaultStudentId` below — Phase 2 will replace it with whichever
/// student the parent picks from their portal record.

enum FirestoreSchema {
    static let defaultStudentId = "default"
}

struct StudentProfileDTO: Codable, Equatable, Sendable {
    let id: UUID
    let firstName: String
    let age: Int
    let primaryFocus: String
    let createdAt: Date
}

struct LessonProgressDTO: Codable, Equatable, Sendable {
    let id: UUID
    let levelIndex: Int
    let category: String
    let isCompleted: Bool
    let lastAttemptAt: Date
    let score: Int
}

struct SparksRecordDTO: Codable, Equatable, Sendable {
    let id: UUID
    let amount: Int
    let reason: String
    let earnedAt: Date
}

// MARK: - SwiftData ↔ DTO bridge

extension StudentProfile {
    var dto: StudentProfileDTO {
        StudentProfileDTO(
            id: id, firstName: firstName, age: age,
            primaryFocus: primaryFocus, createdAt: createdAt
        )
    }
}

extension LessonProgress {
    var dto: LessonProgressDTO {
        LessonProgressDTO(
            id: id, levelIndex: levelIndex, category: category,
            isCompleted: isCompleted, lastAttemptAt: lastAttemptAt, score: score
        )
    }
}

extension SparksRecord {
    var dto: SparksRecordDTO {
        SparksRecordDTO(
            id: id, amount: amount, reason: reason, earnedAt: earnedAt
        )
    }
}
