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
}
