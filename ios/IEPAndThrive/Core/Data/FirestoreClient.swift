import ComposableArchitecture
import FirebaseFirestore
import Foundation

/// Firestore write-through layer for the iOS app's local SwiftData store.
///
/// All operations are scoped to a single authenticated UID. Callers
/// fetch the UID from `AuthClient.currentUserId()` before calling these.
/// Firestore's offline persistence handles network outages — writes
/// queue locally and replay when connectivity returns, so callers can
/// treat these as fire-and-forget on the happy path.
struct FirestoreClient {
    var syncProfile: @Sendable (_ uid: String, _ profile: StudentProfileDTO) async throws -> Void
    var syncLesson:  @Sendable (_ uid: String, _ lesson: LessonProgressDTO) async throws -> Void
    var syncSparks:  @Sendable (_ uid: String, _ record: SparksRecordDTO) async throws -> Void
}

extension FirestoreClient: DependencyKey {
    static let liveValue = Self(
        syncProfile: { uid, profile in
            try Firestore.firestore()
                .collection("users").document(uid)
                .collection("students").document(FirestoreSchema.defaultStudentId)
                .setData(from: profile, merge: true)
        },
        syncLesson: { uid, lesson in
            try Firestore.firestore()
                .collection("users").document(uid)
                .collection("students").document(FirestoreSchema.defaultStudentId)
                .collection("lessons").document(lesson.id.uuidString)
                .setData(from: lesson, merge: true)
        },
        syncSparks: { uid, record in
            try Firestore.firestore()
                .collection("users").document(uid)
                .collection("students").document(FirestoreSchema.defaultStudentId)
                .collection("sparks").document(record.id.uuidString)
                .setData(from: record, merge: true)
        }
    )

    static let testValue = Self(
        syncProfile: { _, _ in },
        syncLesson:  { _, _ in },
        syncSparks:  { _, _ in }
    )
}

extension DependencyValues {
    var firestoreClient: FirestoreClient {
        get { self[FirestoreClient.self] }
        set { self[FirestoreClient.self] = newValue }
    }
}

// MARK: - Codable bridge for setData(from:)
//
// Firestore exposes `setData(from:)` only via the FirebaseFirestoreSwift
// add-on. Recent firebase-ios-sdk releases ship that helper inside the
// main FirebaseFirestore module, so the import above is all we need.
