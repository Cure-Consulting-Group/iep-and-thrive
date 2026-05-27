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

    // Read side — used by the Phase 2.2 anon→authenticated migration
    // and (eventually) cold-start hydration on a fresh device.
    var fetchProfile:    @Sendable (_ uid: String) async throws -> StudentProfileDTO?
    var fetchAllLessons: @Sendable (_ uid: String) async throws -> [LessonProgressDTO]
    var fetchAllSparks:  @Sendable (_ uid: String) async throws -> [SparksRecordDTO]

    /// Copies the anonymous UID's profile + lessons + sparks under the
    /// authenticated UID's paths. Non-destructive: anon docs are left
    /// in place so a failed migration can be retried. Authed paths
    /// take the same document IDs as anon, so re-running this is
    /// idempotent on the happy path.
    var migrateAnonData: @Sendable (_ anon: String, _ authed: String) async throws -> Void
}

extension FirestoreClient: DependencyKey {
    private static func studentDoc(_ uid: String) -> DocumentReference {
        Firestore.firestore()
            .collection("users").document(uid)
            .collection("students").document(FirestoreSchema.defaultStudentId)
    }

    static let liveValue = Self(
        syncProfile: { uid, profile in
            try Self.studentDoc(uid).setData(from: profile, merge: true)
        },
        syncLesson: { uid, lesson in
            try Self.studentDoc(uid)
                .collection("lessons").document(lesson.id.uuidString)
                .setData(from: lesson, merge: true)
        },
        syncSparks: { uid, record in
            try Self.studentDoc(uid)
                .collection("sparks").document(record.id.uuidString)
                .setData(from: record, merge: true)
        },
        fetchProfile: { uid in
            let snap = try await Self.studentDoc(uid).getDocument()
            return try snap.data(as: StudentProfileDTO.self)
        },
        fetchAllLessons: { uid in
            let snap = try await Self.studentDoc(uid)
                .collection("lessons").getDocuments()
            return snap.documents.compactMap { try? $0.data(as: LessonProgressDTO.self) }
        },
        fetchAllSparks: { uid in
            let snap = try await Self.studentDoc(uid)
                .collection("sparks").getDocuments()
            return snap.documents.compactMap { try? $0.data(as: SparksRecordDTO.self) }
        },
        migrateAnonData: { anon, authed in
            // Read everything first so a partial-failure mid-write
            // doesn't lose half the data — both sides exist after.
            let profile = try? await Firestore.firestore()
                .collection("users").document(anon)
                .collection("students").document(FirestoreSchema.defaultStudentId)
                .getDocument()
                .data(as: StudentProfileDTO.self)
            let lessons: [LessonProgressDTO] = (try? await Firestore.firestore()
                .collection("users").document(anon)
                .collection("students").document(FirestoreSchema.defaultStudentId)
                .collection("lessons").getDocuments()
                .documents.compactMap { try? $0.data(as: LessonProgressDTO.self) }
            ) ?? []
            let sparks: [SparksRecordDTO] = (try? await Firestore.firestore()
                .collection("users").document(anon)
                .collection("students").document(FirestoreSchema.defaultStudentId)
                .collection("sparks").getDocuments()
                .documents.compactMap { try? $0.data(as: SparksRecordDTO.self) }
            ) ?? []

            // Write everything under the authed UID with the same IDs.
            let authedDoc = Self.studentDoc(authed)
            if let profile {
                try authedDoc.setData(from: profile, merge: true)
            }
            for lesson in lessons {
                try authedDoc.collection("lessons").document(lesson.id.uuidString)
                    .setData(from: lesson, merge: true)
            }
            for record in sparks {
                try authedDoc.collection("sparks").document(record.id.uuidString)
                    .setData(from: record, merge: true)
            }
        }
    )

    static let testValue = Self(
        syncProfile: { _, _ in },
        syncLesson:  { _, _ in },
        syncSparks:  { _, _ in },
        fetchProfile:    { _ in nil },
        fetchAllLessons: { _ in [] },
        fetchAllSparks:  { _ in [] },
        migrateAnonData: { _, _ in }
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
