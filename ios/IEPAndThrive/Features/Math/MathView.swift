import SwiftUI
import ComposableArchitecture

struct MathView: View {
    let store: StoreOf<MathFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.creamDeep.ignoresSafeArea()

                VStack {
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
                    }
                    .padding()

                    Text(viewStore.equation)
                        .font(Theme.Fonts.display(size: 40))
                        .padding()

                    Spacer()

                    // Physics Tray Placeholder
                    HStack {
                        ForEach(0..<viewStore.currentCount, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Theme.Colors.amber)
                                .frame(width: 50, height: 50)
                        }
                    }

                    Spacer()

                    Button("Check Answer") {
                        viewStore.send(.checkAnswerTapped)
                    }
                    .padding()
                    .background(viewStore.currentCount > 0 ? Theme.Colors.forest : Theme.Colors.textMuted)
                    .foregroundColor(.white)
                    .clipShape(Capsule())
                    .disabled(viewStore.currentCount == 0)
                }
            }
        }
    }
}
