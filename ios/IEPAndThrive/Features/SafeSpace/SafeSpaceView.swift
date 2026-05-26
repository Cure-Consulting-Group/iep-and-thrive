import SwiftUI
import ComposableArchitecture

struct SafeSpaceView: View {
    let store: StoreOf<SafeSpaceFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                // Immersive hand-painted room illustration from Stitch
                Image("SafeSpaceBg")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .ignoresSafeArea()
                
                VStack {
                    HStack {
                        Button("Exit Safe Space") {
                            viewStore.send(.exitTapped)
                        }
                        .padding()
                        .background(Theme.Colors.sage.opacity(0.8))
                        .foregroundColor(Theme.Colors.forest)
                        .clipShape(Capsule())

                        Spacer()
                    }
                    .padding()
                    
                    Spacer()
                    
                    // Interactive Digital Pet
                    VStack(spacing: 20) {
                        PetView(mood: viewStore.petMood)
                            .onTapGesture {
                                viewStore.send(.petTapped)
                            }
                        
                        Text(moodText(for: viewStore.petMood))
                            .font(Theme.Fonts.body(size: 18))
                            .foregroundColor(Theme.Colors.textMuted)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(.ultraThinMaterial)
                            .clipShape(Capsule())
                    }
                    
                    Spacer()
                    
                    // Audio Controls
                    HStack(spacing: 20) {
                        Image(systemName: "leaf.fill")
                            .foregroundColor(Theme.Colors.forest)
                        
                        Slider(value: viewStore.binding(
                            get: \.volume,
                            send: SafeSpaceFeature.Action.volumeChanged
                        ))
                        .accentColor(Theme.Colors.forest)
                        .frame(width: 200)
                    }
                    .padding()
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .padding(.bottom, 40)
                }
            }
            .onAppear {
                viewStore.send(.onAppear)
            }
        }
    }
    
    private func moodText(for mood: SafeSpaceFeature.State.PetMood) -> String {
        switch mood {
        case .happy: return "Your pet is happy!"
        case .playful: return "Ready to play!"
        case .sleepy: return "Shhh... resting."
        }
    }
}

struct PetView: View {
    let mood: SafeSpaceFeature.State.PetMood
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            // Shadow
            Ellipse()
                .fill(Color.black.opacity(0.1))
                .frame(width: 120, height: 20)
                .offset(y: 90)
                .scaleEffect(isAnimating ? 1.1 : 1.0)
            
            // Pet Body (SF Symbol as placeholder for digital pet)
            Image(systemName: petIcon)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 180, height: 180)
                .foregroundColor(Theme.Colors.amber)
                .scaleEffect(isAnimating ? 1.05 : 1.0)
                .offset(y: isAnimating ? -10 : 0)
                .animation(animation, value: isAnimating)
        }
        .onAppear {
            isAnimating = true
        }
    }
    
    private var petIcon: String {
        switch mood {
        case .happy: return "dog.fill"
        case .playful: return "dog.circle.fill"
        case .sleepy: return "dog"
        }
    }
    
    private var animation: Animation {
        switch mood {
        case .happy:
            return .spring(response: 0.4, dampingFraction: 0.6).repeatForever(autoreverses: true)
        case .playful:
            return .interpolatingSpring(stiffness: 50, damping: 1).repeatForever(autoreverses: true)
        case .sleepy:
            return .easeInOut(duration: 2.0).repeatForever(autoreverses: true)
        }
    }
}
