import ComposableArchitecture
import FirebaseFirestore
import Foundation

/// Firestore write-through layer for the iOS app's local SwiftData store.
///
/// All operations are scoped to a single authenticated UID + a chosen
/// `studentId`. Callers (RootFeature) keep track of the current
/// student — anonymous flows use `FirestoreSchema.defaultStudentId`
/// (constant `"default"`), authenticated flows pick a real student from
/// the parent's portal record via the child picker.
///
/// Firestore's offline persistence handles network outages — writes
/// queue locally and replay when connectivity returns, so callers can
/// treat these as fire-and-forget on the happy path.
struct FirestoreClient {
    var syncProfile: @Sendable (_ uid: String, _ studentId: String, _ profile: StudentProfileDTO) async throws -> Void
    var syncLesson:  @Sendable (_ uid: String, _ studentId: String, _ lesson: LessonProgressDTO) async throws -> Void
    var syncSparks:  @Sendable (_ uid: String, _ studentId: String, _ record: SparksRecordDTO) async throws -> Void

    // Read side — used by migration + (eventually) cold-start hydration.
    var fetchProfile:    @Sendable (_ uid: String, _ studentId: String) async throws -> StudentProfileDTO?
    var fetchAllLessons: @Sendable (_ uid: String, _ studentId: String) async throws -> [LessonProgressDTO]
    var fetchAllSparks:  @Sendable (_ uid: String, _ studentId: String) async throws -> [SparksRecordDTO]

    /// Returns every student doc under the authenticated UID's
    /// `students/` collection. Used by the child picker to populate the
    /// row list. May include the web-portal-created students PLUS any
    /// iOS-created student docs that have been migrated.
    var fetchAllStudents: @Sendable (_ uid: String) async throws -> [StudentSummaryDTO]

    /// Copies the anonymous UID's profile + lessons + sparks under the
    /// authenticated UID at the specified `toStudentId`. Anon docs are
    /// always read from `defaultStudentId`. Non-destructive on the anon
    /// side; idempotent on re-run (writes use the same UUIDs).
    var migrateAnonData: @Sendable (_ anon: String, _ authed: String, _ toStudentId: String) async throws -> Void
}

extension FirestoreClient: DependencyKey {
    private static func studentDoc(uid: String, studentId: String) -> DocumentReference {
        Firestore.firestore()
            .collection("users").document(uid)
            .collection("students").document(studentId)
    }

    static let liveValue = Self(
        syncProfile: { uid, studentId, profile in
            try Self.studentDoc(uid: uid, studentId: studentId)
                .setData(from: profile, merge: true)
        },
        syncLesson: { uid, studentId, lesson in
            try Self.studentDoc(uid: uid, studentId: studentId)
                .collection("lessons").document(lesson.id.uuidString)
                .setData(from: lesson, merge: true)
        },
        syncSparks: { uid, studentId, record in
            try Self.studentDoc(uid: uid, studentId: studentId)
                .collection("sparks").document(record.id.uuidString)
                .setData(from: record, merge: true)
        },
        fetchProfile: { uid, studentId in
            let snap = try await Self.studentDoc(uid: uid, studentId: studentId)
                .getDocument()
            return try snap.data(as: StudentProfileDTO.self)
        },
        fetchAllLessons: { uid, studentId in
            let snap = try await Self.studentDoc(uid: uid, studentId: studentId)
                .collection("lessons").getDocuments()
            return snap.documents.compactMap { try? $0.data(as: LessonProgressDTO.self) }
        },
        fetchAllSparks: { uid, studentId in
            let snap = try await Self.studentDoc(uid: uid, studentId: studentId)
                .collection("sparks").getDocuments()
            return snap.documents.compactMap { try? $0.data(as: SparksRecordDTO.self) }
        },
        fetchAllStudents: { uid in
            let snap = try await Firestore.firestore()
                .collection("users").document(uid)
                .collection("students").getDocuments()
            return snap.documents.compactMap { doc in
                guard var summary = try? doc.data(as: StudentSummaryDTO.self) else {
                    return nil
                }
                // CodingKeys placeholder fills `id` with "" — overwrite
                // with the Firestore document ID at the call site.
                summary = StudentSummaryDTO(
                    id: doc.documentID,
                    firstName: summary.firstName,
                    age: summary.age,
                    createdAt: summary.createdAt
                )
                return summary
            }
        },
        migrateAnonData: { anon, authed, toStudentId in
            // Anon side always uses the default student ID — anon flows
            // don't know about multi-child households.
            let anonDoc = Self.studentDoc(uid: anon, studentId: FirestoreSchema.defaultStudentId)

            let profile = try? await anonDoc.getDocument()
                .data(as: StudentProfileDTO.self)
            let lessons: [LessonProgressDTO] = (try? await anonDoc
                .collection("lessons").getDocuments()
                .documents.compactMap { try? $0.data(as: LessonProgressDTO.self) }
            ) ?? []
            let sparks: [SparksRecordDTO] = (try? await anonDoc
                .collection("sparks").getDocuments()
                .documents.compactMap { try? $0.data(as: SparksRecordDTO.self) }
            ) ?? []

            let target = Self.studentDoc(uid: authed, studentId: toStudentId)
            if let profile {
                try target.setData(from: profile, merge: true)
            }
            for lesson in lessons {
                try target.collection("lessons").document(lesson.id.uuidString)
                    .setData(from: lesson, merge: true)
            }
            for record in sparks {
                try target.collection("sparks").document(record.id.uuidString)
                    .setData(from: record, merge: true)
            }
        }
    )

    static let testValue = Self(
        syncProfile: { _, _, _ in },
        syncLesson:  { _, _, _ in },
        syncSparks:  { _, _, _ in },
        fetchProfile:    { _, _ in nil },
        fetchAllLessons: { _, _ in [] },
        fetchAllSparks:  { _, _ in [] },
        fetchAllStudents: { _ in [] },
        migrateAnonData: { _, _, _ in }
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
