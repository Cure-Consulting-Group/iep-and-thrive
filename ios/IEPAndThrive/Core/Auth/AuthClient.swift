import ComposableArchitecture
import FirebaseAuth
import Foundation
#if canImport(AuthenticationServices)
import AuthenticationServices
#endif

/// Firebase Auth wrapper. Phase 1 exposes anonymous sign-in (every
/// device gets a stable durable UID). Phase 2.2 adds email/password
/// sign-in + sign-up + sign-out, and the parent flow migrates the
/// anonymous UID's Firestore data under the new authenticated UID.
struct AuthClient {
    /// Returns the current user's UID, signing in anonymously if no
    /// session exists. Idempotent — safe to call multiple times.
    var signInAnonymously: @Sendable () async throws -> String

    /// Synchronous access to the currently signed-in UID. Returns nil
    /// before `signInAnonymously` has resolved.
    var currentUserId: @Sendable () -> String?

    /// Email/password sign-in for an existing parent account. Replaces
    /// any active anonymous session — caller is responsible for
    /// migrating the anon UID's data before this overwrites it.
    var signIn: @Sendable (_ email: String, _ password: String) async throws -> String

    /// Email/password sign-up. Creates a new Firebase Auth user and
    /// returns the new UID. Parent caller migrates anon data to it.
    var signUp: @Sendable (_ email: String, _ password: String) async throws -> String

    /// Sign out of the current account. Next launch will fall back to
    /// anonymous sign-in via `signInAnonymously()`.
    var signOut: @Sendable () async throws -> Void

    /// Exchange an Apple ID token (from `SignInWithAppleButton`) for a
    /// Firebase credential and complete the sign-in. The raw nonce is
    /// the same one the View hashed before sending to Apple — Firebase
    /// verifies the hash matches the ID token's claim.
    var signInWithApple: @Sendable (
        _ idToken: String,
        _ rawNonce: String,
        _ fullName: PersonNameComponents?
    ) async throws -> String
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
        },
        signIn: { email, password in
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            return result.user.uid
        },
        signUp: { email, password in
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            return result.user.uid
        },
        signOut: {
            try Auth.auth().signOut()
        },
        signInWithApple: { idToken, rawNonce, fullName in
            let credential = OAuthProvider.appleCredential(
                withIDToken: idToken,
                rawNonce: rawNonce,
                fullName: fullName
            )
            let result = try await Auth.auth().signIn(with: credential)
            return result.user.uid
        }
    )

    static let testValue = Self(
        signInAnonymously: { "test-uid" },
        currentUserId: { "test-uid" },
        signIn: { _, _ in "authed-uid" },
        signUp: { _, _ in "authed-uid" },
        signOut: { },
        signInWithApple: { _, _, _ in "authed-uid" }
    )
}

extension DependencyValues {
    var authClient: AuthClient {
        get { self[AuthClient.self] }
        set { self[AuthClient.self] = newValue }
    }
}
