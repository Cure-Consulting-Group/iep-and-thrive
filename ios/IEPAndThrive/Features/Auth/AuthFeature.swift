import ComposableArchitecture
import SwiftUI

/// Parent-facing email/password auth modal. Opened from the Onboarding
/// screen via "Already have an account? Sign in". On success, the
/// parent RootFeature is responsible for migrating the anonymous UID's
/// Firestore data under the new authenticated UID.
@Reducer
struct AuthFeature {
    struct State: Equatable {
        var email: String = ""
        var password: String = ""
        var mode: Mode = .signIn
        var isSubmitting: Bool = false
        var errorMessage: String? = nil

        enum Mode: String, Equatable, CaseIterable, Identifiable {
            case signIn, signUp
            var id: String { rawValue }
            var title: String { self == .signIn ? "Sign In" : "Sign Up" }
            var submitTitle: String {
                self == .signIn ? "Sign in" : "Create account"
            }
            var toggleTitle: String {
                self == .signIn
                    ? "Don't have an account? Create one"
                    : "Already have an account? Sign in"
            }
        }

        /// Email + password both non-empty. Phase 2.2 keeps validation
        /// minimal — Firebase Auth returns rich errors (weak password,
        /// invalid email, etc.) that surface via `errorMessage`.
        var canSubmit: Bool {
            !email.trimmingCharacters(in: .whitespaces).isEmpty
                && !password.isEmpty
                && !isSubmitting
        }
    }

    enum Action {
        case emailChanged(String)
        case passwordChanged(String)
        case modeToggled
        case submitTapped
        case authSucceeded(uid: String)
        case authFailed(message: String)
        case dismissTapped
        /// Fired up to the parent once auth resolves with a UID — the
        /// parent runs migration and updates RootFeature.currentUid.
        case delegate(Delegate)

        @CasePathable
        enum Delegate: Equatable {
            case signedIn(uid: String)
        }
    }

    @Dependency(\.authClient) var authClient
    @Dependency(\.dismiss) var dismiss

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .emailChanged(email):
                state.email = email
                state.errorMessage = nil
                return .none

            case let .passwordChanged(password):
                state.password = password
                state.errorMessage = nil
                return .none

            case .modeToggled:
                state.mode = (state.mode == .signIn) ? .signUp : .signIn
                state.errorMessage = nil
                return .none

            case .submitTapped:
                guard state.canSubmit else { return .none }
                state.isSubmitting = true
                state.errorMessage = nil
                let email = state.email.trimmingCharacters(in: .whitespaces)
                let password = state.password
                let mode = state.mode
                return .run { [authClient] send in
                    do {
                        let uid = try await {
                            switch mode {
                            case .signIn: try await authClient.signIn(email, password)
                            case .signUp: try await authClient.signUp(email, password)
                            }
                        }()
                        await send(.authSucceeded(uid: uid))
                    } catch {
                        await send(.authFailed(message: error.localizedDescription))
                    }
                }

            case let .authSucceeded(uid):
                state.isSubmitting = false
                return .concatenate(
                    .send(.delegate(.signedIn(uid: uid))),
                    .run { _ in await dismiss() }
                )

            case let .authFailed(message):
                state.isSubmitting = false
                state.errorMessage = message
                return .none

            case .dismissTapped:
                return .run { _ in await dismiss() }

            case .delegate:
                return .none
            }
        }
    }
}
