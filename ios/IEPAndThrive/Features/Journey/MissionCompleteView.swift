import SwiftUI
import ComposableArchitecture

struct MissionCompleteView: View {
    let store: StoreOf<MissionCompleteFeature>

    @State private var burst = false

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            VStack(spacing: 24) {
                Spacer()

                ZStack {
                    Circle()
                        .fill(Theme.Colors.sagePale)
                        .frame(width: 140, height: 140)
                        .scaleEffect(burst ? 1.0 : 0.6)

                    Image(systemName: "star.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 70, height: 70)
                        .foregroundColor(Theme.Colors.amber)
                        .rotationEffect(.degrees(burst ? 0 : -25))
                        .scaleEffect(burst ? 1.0 : 0.5)
                }
                .animation(.spring(response: 0.55, dampingFraction: 0.6), value: burst)

                VStack(spacing: 8) {
                    Text("Mission Complete!")
                        .font(Theme.Fonts.display(size: 32))
                        .foregroundColor(Theme.Colors.forest)
                        .multilineTextAlignment(.center)

                    Text(viewStore.levelTitle)
                        .font(Theme.Fonts.body(size: 17))
                        .foregroundColor(Theme.Colors.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 32)

                HStack(spacing: 8) {
                    Image(systemName: "sparkles")
                        .foregroundColor(Theme.Colors.amber)
                    Text("+\(viewStore.sparksAwarded) sparks")
                        .font(Theme.Fonts.body(size: 18, weight: .bold))
                        .foregroundColor(Theme.Colors.forest)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(Theme.Colors.amberLight)
                .clipShape(Capsule())

                Spacer()

                Button {
                    viewStore.send(.continueTapped)
                } label: {
                    Text("Keep Exploring")
                        .font(Theme.Fonts.body(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Theme.Colors.forest)
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 40)
            }
            .frame(maxWidth: .infinity)
            .background(Theme.Colors.cream)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard))
            .onAppear { burst = true }
        }
    }
}
