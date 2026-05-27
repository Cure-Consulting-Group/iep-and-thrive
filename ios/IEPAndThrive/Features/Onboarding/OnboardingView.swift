import SwiftUI
import ComposableArchitecture

struct OnboardingView: View {
    let store: StoreOf<OnboardingFeature>

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.cream.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 28) {
                        VStack(spacing: 8) {
                            Text("Welcome, Parent!")
                                .font(Theme.Fonts.display(size: 34))
                                .foregroundColor(Theme.Colors.forest)
                            Text("Tell us about your child so we can shape their journey.")
                                .font(Theme.Fonts.body(size: 15))
                                .foregroundColor(Theme.Colors.textMuted)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .padding(.top, 32)

                        nameField(viewStore: viewStore)
                        ageField(viewStore: viewStore)
                        focusField(viewStore: viewStore)

                        Button {
                            viewStore.send(.continueTapped)
                        } label: {
                            Text("Continue")
                                .font(Theme.Fonts.body(size: 18, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(viewStore.canContinue ? Theme.Colors.forest : Theme.Colors.textMuted)
                                .clipShape(Capsule())
                        }
                        .disabled(!viewStore.canContinue)
                        .padding(.horizontal)
                        .padding(.top, 8)

                        Button {
                            viewStore.send(.signInTapped)
                        } label: {
                            Text("Already have an account? Sign in")
                                .font(Theme.Fonts.body(size: 14))
                                .foregroundColor(Theme.Colors.forestMid)
                        }
                        .padding(.top, 4)
                    }
                    .padding(.bottom, 40)
                }
            }
        }
    }

    private func nameField(viewStore: ViewStoreOf<OnboardingFeature>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Child's First Name")
                .font(Theme.Fonts.body(size: 14, weight: .bold))
                .foregroundColor(Theme.Colors.text)
            TextField(
                "Name",
                text: viewStore.binding(get: \.childName, send: OnboardingFeature.Action.nameChanged)
            )
            .textInputAutocapitalization(.words)
            .padding()
            .background(Color.white)
            .cornerRadius(Theme.Layout.cornerRadiusElement)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusElement)
                    .stroke(Theme.Colors.forest, lineWidth: 1)
            )
        }
        .padding(.horizontal)
    }

    private func ageField(viewStore: ViewStoreOf<OnboardingFeature>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Age")
                .font(Theme.Fonts.body(size: 14, weight: .bold))
                .foregroundColor(Theme.Colors.text)
            Picker("Age", selection: viewStore.binding(
                get: \.age,
                send: OnboardingFeature.Action.ageSelected
            )) {
                ForEach(OnboardingFeature.ageRange, id: \.self) { age in
                    Text("\(age)").tag(age)
                }
            }
            .pickerStyle(.segmented)
        }
        .padding(.horizontal)
    }

    private func focusField(viewStore: ViewStoreOf<OnboardingFeature>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Primary Focus")
                .font(Theme.Fonts.body(size: 14, weight: .bold))
                .foregroundColor(Theme.Colors.text)
            HStack(spacing: 12) {
                ForEach(OnboardingFeature.State.FocusType.allCases) { focus in
                    let isSelected = viewStore.primaryFocus == focus
                    Button {
                        viewStore.send(.focusSelected(focus))
                    } label: {
                        Text(focus.displayName)
                            .font(Theme.Fonts.body(size: 15, weight: .bold))
                            .foregroundColor(isSelected ? .white : Theme.Colors.forest)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(isSelected ? Theme.Colors.forest : Theme.Colors.sagePale)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(.horizontal)
    }
}
