import ComposableArchitecture
import Foundation

/// Parent-only settings sheet. Opened from the cog icon on JourneyView.
/// Phase 3.4 only carries the sign-out affordance — future polish work
/// can layer in account info, account deletion, parental-controls
/// toggles, etc. without restructuring this surface.
@Reducer
struct SettingsFeature {
    struct State: Equatable {
        let uid: String?
        var isSigningOut: Bool = false
        var errorMessage: String? = nil

        /// Truncated UID for the "Signed in as" row. Full UIDs are noise
        /// in the UI — first 8 chars is enough to disambiguate accounts.
        var uidDisplay: String {
            guard let uid, !uid.isEmpty else { return "Anonymous" }
            return "Account ID: \(uid.prefix(8))"
        }
    }

    enum Action {
        case signOutTapped
        case signOutSucceeded
        case signOutFailed(message: String)
        case dismissTapped
        case delegate(Delegate)

        @CasePathable
        enum Delegate: Equatable {
            /// Parent confirmed sign-out. RootFeature resets currentUid,
            /// re-runs anonymous sign-in, and rebinds journey.studentId
            /// to the default.
            case signedOut
        }
    }

    @Dependency(\.authClient) var authClient
    @Dependency(\.dismiss) var dismiss

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .signOutTapped:
                state.isSigningOut = true
                state.errorMessage = nil
                return .run { [authClient] send in
                    do {
                        try await authClient.signOut()
                        await send(.signOutSucceeded)
                    } catch {
                        await send(.signOutFailed(message: error.localizedDescription))
                    }
                }

            case .signOutSucceeded:
                state.isSigningOut = false
                return .concatenate(
                    .send(.delegate(.signedOut)),
                    .run { _ in await dismiss() }
                )

            case let .signOutFailed(message):
                state.isSigningOut = false
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
