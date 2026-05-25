import SwiftUI
import ComposableArchitecture

struct JourneyView: View {
    let store: StoreOf<JourneyFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.cream.ignoresSafeArea()
                
                VStack {
                    HStack {
                        Spacer()
                        SparksCounter(count: viewStore.sparksCount)
                            .padding()
                    }
                    
                    ScrollView {
                        VStack(spacing: 40) {
                            ForEach(1...10, id: \.self) { level in
                                JourneyNodeView(
                                    level: level,
                                    isActive: level == viewStore.currentLevel,
                                    isUnlocked: viewStore.unlockedLevels.contains(level)
                                ) {
                                    viewStore.send(.nodeTapped(level))
                                }
                            }
                        }
                        .padding(.vertical, 100)
                    }
                }
                
                VStack {
                    Spacer()
                    HStack {
                        Button {
                            viewStore.send(.safeSpaceTapped)
                        } label: {
                            Image(systemName: "heart.fill")
                                .foregroundColor(.white)
                                .padding()
                                .background(Theme.Colors.sage)
                                .clipShape(Circle())
                                .shadow(radius: 5)
                        }
                        .padding()
                        Spacer()
                    }
                }
            }
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
