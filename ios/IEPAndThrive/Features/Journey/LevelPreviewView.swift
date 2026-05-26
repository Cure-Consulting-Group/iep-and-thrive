import SwiftUI
import ComposableArchitecture

struct LevelPreviewView: View {
    let store: StoreOf<LevelPreviewFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            VStack(spacing: 24) {
                // Biome Icon / Header Image
                ZStack {
                    Circle()
                        .fill(Theme.Colors.sagePale)
                        .frame(width: 120, height: 120)
                    
                    Image(systemName: biomeIcon(for: viewStore.level.biome))
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 60, height: 60)
                        .foregroundColor(Theme.Colors.forest)
                }
                .padding(.top, 40)
                
                VStack(spacing: 8) {
                    Text(viewStore.level.title)
                        .font(Theme.Fonts.display(size: 32))
                        .foregroundColor(Theme.Colors.forest)
                        .multilineTextAlignment(.center)
                    
                    Text("MISSION")
                        .font(Theme.Fonts.body(size: 12, weight: .bold))
                        .foregroundColor(Theme.Colors.textMuted)
                        .kerning(1.2)
                }
                
                Text("Help your Explorer master \(viewStore.level.targetValue) in the \(viewStore.level.biome.rawValue) biome.")
                    .font(Theme.Fonts.body(size: 18))
                    .foregroundColor(Theme.Colors.text)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                
                Spacer()
                
                Button {
                    viewStore.send(.startButtonTapped(viewStore.level))
                } label: {
                    Text("Start Mission")
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
            .background(Theme.Colors.cream)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard))
            .padding()
        }
    }
    
    private func biomeIcon(for biome: LevelDefinition.Biome) -> String {
        switch biome {
        case .forest: return "leaf.fill"
        case .desert: return "sun.max.fill"
        case .mountain: return "mountain.2.fill"
        }
    }
}

#Preview {
    LevelPreviewView(
        store: Store(initialState: LevelPreviewFeature.State(
            level: LevelDefinition(id: "test", title: "Forest of Phonics", category: .literacy, targetValue: "a", biome: .forest)
        )) {
            LevelPreviewFeature()
        }
    )
}
