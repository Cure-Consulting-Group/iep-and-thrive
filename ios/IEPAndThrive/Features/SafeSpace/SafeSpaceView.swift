import SwiftUI
import ComposableArchitecture

struct SafeSpaceView: View {
    let store: StoreOf<SafeSpaceFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                // Background: Hand-painted room placeholder matching "Island of Discovery" vibe
                LinearGradient(
                    gradient: Gradient(colors: [Theme.Colors.sagePale, Theme.Colors.creamDeep]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                // Room details
                GeometryReader { geo in
                    // Floor
                    Rectangle()
                        .fill(Theme.Colors.creamDeep)
                        .frame(height: geo.size.height * 0.3)
                        .position(x: geo.size.width / 2, y: geo.size.height * 0.85)
                    
                    // A "window" with forest view (Stitch design placeholder)
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Theme.Colors.forestLight.opacity(0.3))
                        .frame(width: 120, height: 160)
                        .overlay(
                            VStack {
                                Text("🌲")
                                    .font(.system(size: 40))
                                Text("Forest View")
                                    .font(Theme.Fonts.body(size: 12))
                                    .foregroundColor(Theme.Colors.forest)
                            }
                        )
                        .position(x: geo.size.width * 0.2, y: geo.size.height * 0.3)
                    
                    // Wall decoration
                    Circle()
                        .fill(Theme.Colors.amber.opacity(0.2))
                        .frame(width: 200, height: 200)
                        .blur(radius: 50)
                        .position(x: geo.size.width * 0.8, y: geo.size.height * 0.2)
                }
                
                VStack {
                    Text("Safe Space")
                        .font(Theme.Fonts.display(size: 32))
                        .foregroundColor(Theme.Colors.forest)
                        .padding(.top, 40)
                    
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
                            .transition(.opacity)
                    }
                    
                    Spacer()
                    
                    // Audio Controls
                    VStack(spacing: 16) {
                        Text("Ambient Volume")
                            .font(Theme.Fonts.body(size: 14, weight: .bold))
                            .foregroundColor(Theme.Colors.forest)
                        
                        HStack(spacing: 20) {
                            Image(systemName: "speaker.fill")
                                .foregroundColor(Theme.Colors.forest)
                            
                            Slider(value: viewStore.binding(
                                get: \.volume,
                                send: SafeSpaceFeature.Action.volumeChanged
                            ))
                            .accentColor(Theme.Colors.forest)
                            
                            Image(systemName: "speaker.wave.3.fill")
                                .foregroundColor(Theme.Colors.forest)
                        }
                        .padding(.horizontal, 40)
                    }
                    .padding(.bottom, 60)
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
