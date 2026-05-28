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

/// Lightweight projection used by the child picker — just the fields
/// needed to render a row + identify the student doc. Read out of the
/// authenticated UID's `users/{uid}/students/` collection.
struct StudentSummaryDTO: Codable, Equatable, Identifiable, Sendable {
    let id: String
    let firstName: String
    let age: Int?
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        // Web portal docs use `name`; iOS-written docs use `firstName`.
        // Decode either so the picker works whether the student was
        // created from the web sign-up or an iOS device.
        case firstName, name, age, createdAt
    }

    init(id: String, firstName: String, age: Int?, createdAt: Date?) {
        self.id = id
        self.firstName = firstName
        self.age = age
        self.createdAt = createdAt
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        // `id` is decoded from the Firestore document ID at the call
        // site, not from the doc body — placeholder so the synthesized
        // init keeps working but the read path overwrites it.
        self.id = ""
        self.firstName = (try? c.decode(String.self, forKey: .firstName))
            ?? (try? c.decode(String.self, forKey: .name))
            ?? ""
        self.age = try? c.decode(Int.self, forKey: .age)
        self.createdAt = try? c.decode(Date.self, forKey: .createdAt)
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(firstName, forKey: .firstName)
        try c.encodeIfPresent(age, forKey: .age)
        try c.encodeIfPresent(createdAt, forKey: .createdAt)
    }
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
