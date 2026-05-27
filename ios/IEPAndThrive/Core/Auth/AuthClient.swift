import ComposableArchitecture
import FirebaseAuth
import FirebaseCore
import Foundation
import GoogleSignIn
import UIKit
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

    /// One-shot Google Sign-In: shows the SDK's OAuth flow, picks up
    /// the resulting ID + access tokens, and exchanges them for a
    /// Firebase credential. Presenter is resolved internally from the
    /// active UIWindowScene — callers don't pass a UIViewController.
    var signInWithGoogle: @Sendable () async throws -> String
}

enum AuthClientError: LocalizedError {
    case noFirebaseClientId
    case noPresentingViewController
    case missingGoogleIDToken

    var errorDescription: String? {
        switch self {
        case .noFirebaseClientId:
            return "Firebase clientID is missing — check GoogleService-Info.plist."
        case .noPresentingViewController:
            return "Could not find a window to present sign-in. Try again."
        case .missingGoogleIDToken:
            return "Google did not return an ID token. Try again."
        }
    }
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
        },
        signInWithGoogle: {
            guard let clientID = FirebaseApp.app()?.options.clientID else {
                throw AuthClientError.noFirebaseClientId
            }
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)

            // Resolve the presenter on the main actor — UIKit's window
            // graph isn't Sendable, so we capture the UIViewController
            // and hop back off MainActor for the SDK call.
            let presenter: UIViewController? = await MainActor.run {
                UIApplication.shared.connectedScenes
                    .compactMap { $0 as? UIWindowScene }
                    .flatMap { $0.windows }
                    .first(where: { $0.isKeyWindow })?
                    .rootViewController
            }
            guard let presenter else {
                throw AuthClientError.noPresentingViewController
            }

            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: presenter)
            guard let idToken = result.user.idToken?.tokenString else {
                throw AuthClientError.missingGoogleIDToken
            }
            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )
            let authResult = try await Auth.auth().signIn(with: credential)
            return authResult.user.uid
        }
    )

    static let testValue = Self(
        signInAnonymously: { "test-uid" },
        currentUserId: { "test-uid" },
        signIn: { _, _ in "authed-uid" },
        signUp: { _, _ in "authed-uid" },
        signOut: { },
        signInWithApple: { _, _, _ in "authed-uid" },
        signInWithGoogle: { "google-authed-uid" }
    )
}

extension DependencyValues {
    var authClient: AuthClient {
        get { self[AuthClient.self] }
        set { self[AuthClient.self] = newValue }
    }
}
