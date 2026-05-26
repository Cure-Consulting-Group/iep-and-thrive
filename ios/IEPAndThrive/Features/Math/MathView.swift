import SwiftUI
import ComposableArchitecture

struct MathView: View {
    let store: StoreOf<MathFeature>

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.creamDeep.ignoresSafeArea()

                VStack(spacing: 16) {
                    HStack {
                        Button {
                            viewStore.send(.backTapped)
                        } label: {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(Theme.Colors.forest)
                                .accessibilityLabel("Back to journey")
                        }
                        Spacer()
                        CountChip(count: viewStore.currentCount, target: viewStore.targetCount)
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)

                    Text(viewStore.prompt)
                        .font(Theme.Fonts.display(size: 36))
                        .foregroundColor(Theme.Colors.forest)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    Text("Tap the tray to add cubes. Drag to move them.")
                        .font(Theme.Fonts.body(size: 14))
                        .foregroundColor(Theme.Colors.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    SnapCubesView(
                        onCountChange: { count in
                            viewStore.send(.blocksChanged(count))
                        },
                        onClear:  { viewStore.send(.blocksChanged(0)) },
                        onRemove: {}
                    )

                    if viewStore.showIncorrectHint, let target = viewStore.targetCount {
                        Text(hintText(currentCount: viewStore.currentCount, target: target))
                            .font(Theme.Fonts.body(size: 14, weight: .bold))
                            .foregroundColor(Theme.Colors.amber)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Theme.Colors.amberLight)
                            .clipShape(Capsule())
                            .transition(.opacity)
                    }

                    Spacer(minLength: 0)

                    Button("Check Answer") {
                        viewStore.send(.checkAnswerTapped)
                    }
                    .font(Theme.Fonts.body(size: 18, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(viewStore.canCheck ? Theme.Colors.forest : Theme.Colors.textMuted)
                    .clipShape(Capsule())
                    .padding(.horizontal)
                    .padding(.bottom, 16)
                    .disabled(!viewStore.canCheck)
                }
            }
            .animation(.easeInOut, value: viewStore.showIncorrectHint)
        }
    }

    private func hintText(currentCount: Int, target: Int) -> String {
        if currentCount < target {
            let needed = target - currentCount
            return "Almost! Add \(needed) more."
        }
        let extra = currentCount - target
        return "Close! Remove \(extra) to make \(target)."
    }
}

private struct CountChip: View {
    let count: Int
    let target: Int?

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "square.stack.3d.up.fill")
                .foregroundColor(Theme.Colors.forest)
            if let target {
                Text("\(count) / \(target)")
                    .font(Theme.Fonts.body(size: 15, weight: .bold))
                    .foregroundColor(Theme.Colors.forest)
                    .contentTransition(.numericText(value: Double(count)))
            } else {
                Text("\(count)")
                    .font(Theme.Fonts.body(size: 15, weight: .bold))
                    .foregroundColor(Theme.Colors.forest)
                    .contentTransition(.numericText(value: Double(count)))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Theme.Colors.sagePale)
        .clipShape(Capsule())
        .animation(.easeInOut, value: count)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(target.map { "\(count) of \($0) cubes" } ?? "\(count) cubes")
    }
}
