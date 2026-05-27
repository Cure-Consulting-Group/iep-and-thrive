import ComposableArchitecture
import FirebaseAuth
import Foundation

/// Firebase Auth wrapper. Phase 1 only exposes anonymous sign-in —
/// every device gets a stable, durable UID with no UI friction. Phase 2
/// will add email/password + child picker and migrate the anonymous
/// UID's data to the parent's authenticated account.
struct AuthClient {
    /// Returns the current user's UID, signing in anonymously if no
    /// session exists. Idempotent — safe to call multiple times.
    var signInAnonymously: @Sendable () async throws -> String

    /// Synchronous access to the currently signed-in UID. Returns nil
    /// before `signInAnonymously` has resolved.
    var currentUserId: @Sendable () -> String?
}

extension AuthClient: DependencyKey {
    static let liveValue = Self(
        signInAnonymously: {
            if let existing = Auth.auth().currentUser {
                return existing.uid
            }
            let result = try await Auth.auth().signInAnonymously()
            return result.user.uid
        },
        currentUserId: {
            Auth.auth().currentUser?.uid
        }
    )

    static let testValue = Self(
        signInAnonymously: { "test-uid" },
        currentUserId: { "test-uid" }
    )
}

extension DependencyValues {
    var authClient: AuthClient {
        get { self[AuthClient.self] }
        set { self[AuthClient.self] = newValue }
    }
}
