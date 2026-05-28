import ComposableArchitecture
import SwiftUI

struct SettingsView: View {
    let store: StoreOf<SettingsFeature>

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            NavigationStack {
                ZStack {
                    Theme.Colors.cream.ignoresSafeArea()

                    VStack(alignment: .leading, spacing: 24) {
                        accountRow(viewStore: viewStore)

                        if let errorMessage = viewStore.errorMessage {
                            errorBanner(errorMessage)
                        }

                        signOutButton(viewStore: viewStore)

                        Spacer()
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 32)
                }
                .navigationTitle("Parent Settings")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") {
                            viewStore.send(.dismissTapped)
                        }
                        .foregroundStyle(Theme.Colors.forest)
                    }
                }
            }
        }
    }

    private func accountRow(viewStore: ViewStoreOf<SettingsFeature>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Signed in")
                .font(Theme.Fonts.body(size: 12, weight: .semibold))
                .tracking(1.6)
                .textCase(.uppercase)
                .foregroundColor(Theme.Colors.forestLight)
            Text(viewStore.uidDisplay)
                .font(Theme.Fonts.body(size: 16, weight: .medium))
                .foregroundColor(Theme.Colors.text)
                .lineLimit(1)
                .truncationMode(.middle)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard)
                .stroke(Theme.Colors.forest.opacity(0.10), lineWidth: 1)
        )
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

    private func signOutButton(viewStore: ViewStoreOf<SettingsFeature>) -> some View {
        Button {
            viewStore.send(.signOutTapped)
        } label: {
            HStack {
                if viewStore.isSigningOut {
                    ProgressView().tint(Theme.Colors.forest)
                }
                Text("Sign out")
                    .font(Theme.Fonts.body(size: 16, weight: .semibold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .foregroundColor(Theme.Colors.forest)
            .overlay(
                Capsule().stroke(Theme.Colors.forest, lineWidth: 1.5)
            )
        }
        .disabled(viewStore.isSigningOut)
    }
}
