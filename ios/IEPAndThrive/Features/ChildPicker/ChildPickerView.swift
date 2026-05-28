import ComposableArchitecture
import SwiftUI

struct ChildPickerView: View {
    let store: StoreOf<ChildPickerFeature>

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            NavigationStack {
                ZStack {
                    Theme.Colors.cream.ignoresSafeArea()

                    ScrollView {
                        VStack(alignment: .leading, spacing: 24) {
                            header

                            if viewStore.isLoading {
                                loading
                            } else if let errorMessage = viewStore.errorMessage {
                                errorBanner(errorMessage)
                            } else {
                                studentList(viewStore: viewStore)
                                addNewChildButton(viewStore: viewStore)
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 32)
                    }
                }
                .navigationTitle("Pick a child")
                .navigationBarTitleDisplayMode(.inline)
            }
            .onAppear { viewStore.send(.onAppear) }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Which child is using this iPad?")
                .font(Theme.Fonts.display(size: 24, weight: .semibold))
                .foregroundColor(Theme.Colors.text)
            Text("Their progress will sync to your portal under this child's record.")
                .font(Theme.Fonts.body(size: 14))
                .foregroundColor(Theme.Colors.textMuted)
        }
    }

    private var loading: some View {
        HStack {
            Spacer()
            ProgressView().tint(Theme.Colors.forest)
            Spacer()
        }
        .padding(.vertical, 48)
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

    private func studentList(viewStore: ViewStoreOf<ChildPickerFeature>) -> some View {
        VStack(spacing: 12) {
            ForEach(viewStore.students) { student in
                Button {
                    viewStore.send(.studentTapped(id: student.id))
                } label: {
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Theme.Colors.sagePale)
                            .frame(width: 40, height: 40)
                            .overlay(
                                Text(initial(for: student.firstName))
                                    .font(Theme.Fonts.display(size: 18, weight: .semibold))
                                    .foregroundColor(Theme.Colors.forest)
                            )
                        VStack(alignment: .leading, spacing: 2) {
                            Text(student.firstName.isEmpty ? "Unnamed child" : student.firstName)
                                .font(Theme.Fonts.body(size: 16, weight: .semibold))
                                .foregroundColor(Theme.Colors.text)
                            if let age = student.age {
                                Text("Age \(age)")
                                    .font(Theme.Fonts.body(size: 13))
                                    .foregroundColor(Theme.Colors.textMuted)
                            }
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(Theme.Colors.textMuted)
                    }
                    .padding(16)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard))
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard)
                            .stroke(Theme.Colors.forest.opacity(0.10), lineWidth: 1)
                    )
                }
            }
        }
    }

    private func addNewChildButton(viewStore: ViewStoreOf<ChildPickerFeature>) -> some View {
        Button {
            viewStore.send(.addNewChildTapped)
        } label: {
            HStack {
                Image(systemName: "plus.circle.fill")
                Text("Set up a new child")
                    .font(Theme.Fonts.body(size: 16, weight: .semibold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .foregroundColor(Theme.Colors.forest)
            .overlay(
                Capsule().stroke(Theme.Colors.forest, lineWidth: 1.5)
            )
        }
    }

    private func initial(for name: String) -> String {
        String(name.first.map(String.init) ?? "?").uppercased()
    }
}
