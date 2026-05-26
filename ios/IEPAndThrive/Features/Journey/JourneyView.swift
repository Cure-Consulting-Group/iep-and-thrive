import SwiftUI
import ComposableArchitecture

struct JourneyView: View {
    let store: StoreOf<JourneyFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                // Biome Backgrounds
                ScrollView(.vertical, showsIndicators: false) {
                    ZStack(alignment: .top) {
                        VStack(spacing: 0) {
                            // Mountain Biome (Top)
                            BiomeSection(title: "The Snowy Peaks", color: Color(white: 0.95))
                            
                            // Desert Biome (Mid)
                            BiomeSection(title: "The Golden Dunes", color: Color(red: 0.98, green: 0.92, blue: 0.8))
                            
                            // Forest Biome (Bottom)
                            BiomeSection(title: "The Whispering Woods", color: Theme.Colors.sagePale)
                        }
                        
                        VStack(spacing: 120) {
                            ForEach(viewStore.levels) { level in
                                JourneyNodeView(
                                    level: (viewStore.levels.firstIndex(of: level) ?? 0) + 1,
                                    isActive: level.id == (viewStore.levels.indices.contains(viewStore.currentLevelIndex) ? viewStore.levels[viewStore.currentLevelIndex].id : ""),
                                    isUnlocked: true // Placeholder: All unlocked for now
                                ) {
                                    viewStore.send(.nodeTapped(level))
                                }
                                .offset(x: offsetForLevel(level, in: viewStore.levels))
                            }
                        }
                        .padding(.vertical, 200)
                    }
                }
                .background(Theme.Colors.cream)
                .onAppear { viewStore.send(.onAppear) }
                
                // Floating UI Overlays
                VStack {
                    HStack {
                        Spacer()
                        SparksCounter(count: viewStore.sparksCount)
                            .padding()
                    }
                    Spacer()
                    HStack {
                        Button {
                            viewStore.send(.safeSpaceTapped)
                        } label: {
                            Image(systemName: "leaf.fill")
                                .font(.title)
                                .foregroundColor(.white)
                                .padding()
                                .background(Theme.Colors.sage)
                                .clipShape(Circle())
                                .shadow(radius: 10)
                        }
                        .padding(30)
                        Spacer()
                    }
                }
            }
            .sheet(
                store: self.store.scope(
                    state: \.$levelPreview,
                    action: \.levelPreview
                )
            ) { store in
                LevelPreviewView(store: store)
                    .presentationDetents([.medium])
                    .presentationDragIndicator(.visible)
            }
        }
    }
    
    private func offsetForLevel(_ level: LevelDefinition, in levels: [LevelDefinition]) -> CGFloat {
        guard let index = levels.firstIndex(of: level) else { return 0 }
        return CGFloat(sin(Double(index) * 0.8) * 100)
    }
}

struct BiomeSection: View {
    let title: String
    let color: Color
    
    var body: some View {
        ZStack {
            color.frame(height: 1000)
            Text(title)
                .font(Theme.Fonts.display(size: 40))
                .foregroundColor(Theme.Colors.forest.opacity(0.2))
        }
    }
}

struct SparksCounter: View {
    let count: Int
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "star.fill")
                .foregroundColor(.white)
            Text("\(count)")
                .font(Theme.Fonts.body(size: 16, weight: .bold))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Theme.Colors.amber)
        .clipShape(Capsule())
    }
}

struct JourneyNodeView: View {
    let level: Int
    let isActive: Bool
    let isUnlocked: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(isUnlocked ? Theme.Colors.forest : Theme.Colors.textMuted)
                    .frame(width: 80, height: 80)
                
                if isActive {
                    Circle()
                        .stroke(Theme.Colors.forestLight, lineWidth: 4)
                        .frame(width: 90, height: 90)
                        .blur(radius: 2)
                }
                
                Text("\(level)")
                    .font(Theme.Fonts.display(size: 24))
                    .foregroundColor(.white)
            }
        }
        .disabled(!isUnlocked)
    }
}
