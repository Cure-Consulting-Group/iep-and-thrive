import AuthenticationServices
import ComposableArchitecture
import SwiftUI

struct AuthView: View {
    let store: StoreOf<AuthFeature>

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            NavigationStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        header(viewStore: viewStore)

                        VStack(spacing: 12) {
                            appleButton(viewStore: viewStore)
                            googleButton(viewStore: viewStore)
                        }
                        orDivider

                        VStack(alignment: .leading, spacing: 16) {
                            emailField(viewStore: viewStore)
                            passwordField(viewStore: viewStore)
                            if let errorMessage = viewStore.errorMessage {
                                errorBanner(errorMessage)
                            }
                        }

                        submitButton(viewStore: viewStore)
                        modeToggle(viewStore: viewStore)
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 32)
                }
                .background(Theme.Colors.cream.ignoresSafeArea())
                .navigationTitle(viewStore.mode.title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Cancel") {
                            viewStore.send(.dismissTapped)
                        }
                        .foregroundStyle(Theme.Colors.forest)
                    }
                }
            }
        }
    }

    private func header(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Parent account")
                .font(Theme.Fonts.body(size: 12, weight: .semibold))
                .tracking(1.6)
                .textCase(.uppercase)
                .foregroundColor(Theme.Colors.forestLight)
            Text(viewStore.mode == .signIn
                 ? "Sign in to sync this device with your portal."
                 : "Create an account to sync progress across devices.")
                .font(Theme.Fonts.display(size: 24, weight: .semibold))
                .foregroundColor(Theme.Colors.text)
                .multilineTextAlignment(.leading)
        }
    }

    private func emailField(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Email")
                .font(Theme.Fonts.body(size: 13, weight: .medium))
                .foregroundColor(Theme.Colors.textMuted)
            TextField(
                "you@example.com",
                text: viewStore.binding(get: \.email, send: AuthFeature.Action.emailChanged)
            )
            .textContentType(.emailAddress)
            .keyboardType(.emailAddress)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .padding(14)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusElement))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusElement)
                    .stroke(Theme.Colors.forest.opacity(0.12), lineWidth: 1)
            )
        }
    }

    private func passwordField(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Password")
                .font(Theme.Fonts.body(size: 13, weight: .medium))
                .foregroundColor(Theme.Colors.textMuted)
            SecureField(
                "••••••••",
                text: viewStore.binding(get: \.password, send: AuthFeature.Action.passwordChanged)
            )
            .textContentType(viewStore.mode == .signIn ? .password : .newPassword)
            .padding(14)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusElement))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusElement)
                    .stroke(Theme.Colors.forest.opacity(0.12), lineWidth: 1)
            )
        }
    }

    private func errorBanner(_ message: String) -> some View {
        Text(message)
            .font(Theme.Fonts.body(size: 13))
            .foregroundColor(Theme.Colors.amber)
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Colors.amberLight)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusElement))
    }

    private func submitButton(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        Button {
            viewStore.send(.submitTapped)
        } label: {
            HStack {
                if viewStore.isSubmitting {
                    ProgressView().tint(.white)
                }
                Text(viewStore.mode.submitTitle)
                    .font(Theme.Fonts.body(size: 16, weight: .semibold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                viewStore.canSubmit ? Theme.Colors.forest : Theme.Colors.forest.opacity(0.4)
            )
            .foregroundColor(.white)
            .clipShape(Capsule())
        }
        .disabled(!viewStore.canSubmit)
    }

    private func modeToggle(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        Button {
            viewStore.send(.modeToggled)
        } label: {
            Text(viewStore.mode.toggleTitle)
                .font(Theme.Fonts.body(size: 14))
                .foregroundColor(Theme.Colors.forestMid)
                .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Sign in with Apple

    private func appleButton(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        SignInWithAppleButton(
            viewStore.mode == .signIn ? .signIn : .signUp,
            onRequest: { request in
                let nonce = NonceGenerator.random()
                request.requestedScopes = [.fullName, .email]
                request.nonce = NonceGenerator.sha256(nonce)
                viewStore.send(.appleNonceGenerated(nonce))
            },
            onCompletion: { result in
                switch result {
                case let .success(authorization):
                    guard
                        let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                        let identityToken = credential.identityToken,
                        let tokenString = String(data: identityToken, encoding: .utf8)
                    else {
                        viewStore.send(.authFailed(
                            message: "Sign in with Apple did not return a valid credential."
                        ))
                        return
                    }
                    viewStore.send(.appleCredentialReceived(
                        idToken: tokenString,
                        fullName: credential.fullName
                    ))
                case let .failure(error):
                    // ASAuthorizationError.canceled is a user-initiated
                    // dismiss — don't shout "Error" at them for it.
                    if (error as? ASAuthorizationError)?.code == .canceled {
                        return
                    }
                    viewStore.send(.authFailed(message: error.localizedDescription))
                }
            }
        )
        .signInWithAppleButtonStyle(.black)
        .frame(height: 50)
        .clipShape(Capsule())
    }

    // MARK: - Google Sign-In

    private func googleButton(viewStore: ViewStoreOf<AuthFeature>) -> some View {
        Button {
            viewStore.send(.googleSignInTapped)
        } label: {
            HStack(spacing: 12) {
                // Inline "G" mark — avoids bundling the Google logo
                // asset for now. Phase 2.3.b polish can swap in the
                // official mark per Google's brand guidelines.
                Text("G")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(Theme.Colors.forest)
                    .frame(width: 22, height: 22)
                    .background(Color.white.clipShape(Circle()))
                Text(viewStore.mode == .signIn
                     ? "Sign in with Google"
                     : "Sign up with Google")
                    .font(Theme.Fonts.body(size: 16, weight: .semibold))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Theme.Colors.forest)
            .clipShape(Capsule())
        }
        .disabled(viewStore.isSubmitting)
    }

    private var orDivider: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(Theme.Colors.forest.opacity(0.15))
                .frame(height: 1)
            Text("or")
                .font(Theme.Fonts.body(size: 12, weight: .medium))
                .foregroundColor(Theme.Colors.textMuted)
            Rectangle()
                .fill(Theme.Colors.forest.opacity(0.15))
                .frame(height: 1)
        }
    }
}
