import SwiftUI
import ComposableArchitecture
import CoreHaptics

struct SandTrayView: View {
    let store: StoreOf<LiteracyFeature>
    
    @State private var strokes: [[CGPoint]] = []
    @State private var currentStroke: [CGPoint] = []
    @State private var hapticEngine: CHHapticEngine?
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                // The Wooden Tray Frame
                RoundedRectangle(cornerRadius: 30)
                    .stroke(Theme.Colors.forest, lineWidth: 15)
                    .background(
                        Theme.Colors.creamDeep // Placeholder for high-res sand texture
                            .overlay(
                                Image(systemName: "square.fill") // Patterned texture placeholder
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .opacity(0.05)
                            )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 30))
                    .padding(20)
                
                // The Ghost Letter Guide
                Text(viewStore.currentLetter)
                    .font(.system(size: 300, weight: .thin, design: .rounded))
                    .foregroundColor(Theme.Colors.forest.opacity(0.1))
                    .accessibilityHidden(true)
                
                // The Interactive Sand Canvas
                Canvas { context, size in
                    for stroke in strokes {
                        var path = Path()
                        path.addLines(stroke)
                        context.stroke(
                            path,
                            with: .color(Theme.Colors.forest.opacity(0.3)),
                            style: StrokeStyle(lineWidth: 25, lineCap: .round, lineJoin: .round)
                        )
                    }
                    
                    if !currentStroke.isEmpty {
                        var path = Path()
                        path.addLines(currentStroke)
                        context.stroke(
                            path,
                            with: .color(Theme.Colors.forest.opacity(0.3)),
                            style: StrokeStyle(lineWidth: 25, lineCap: .round, lineJoin: .round)
                        )
                    }
                }
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            currentStroke.append(value.location)
                            playHapticFeedback()
                        }
                        .onEnded { _ in
                            strokes.append(currentStroke)
                            currentStroke = []
                            // Eventually trigger validation action to store
                            viewStore.send(.tracingEnded(true)) // Placeholder success
                        }
                )
                .padding(40)
                
                // UI Overlays
                VStack {
                    HStack {
                        Button {
                            // Audio repeat logic
                        } label: {
                            Image(systemName: "speaker.wave.2.circle.fill")
                                .font(.system(size: 44))
                                .foregroundColor(Theme.Colors.forest)
                        }
                        .padding(40)
                        Spacer()
                    }
                    Spacer()
                    HStack {
                        Spacer()
                        Button("Done") {
                            viewStore.send(.doneTapped)
                        }
                        .font(Theme.Fonts.body(size: 20, weight: .bold))
                        .padding(.horizontal, 40)
                        .padding(.vertical, 15)
                        .background(Theme.Colors.sage)
                        .foregroundColor(.white)
                        .clipShape(Capsule())
                        .padding(40)
                    }
                }
            }
            .onAppear(perform: prepareHaptics)
        }
    }
    
    // MARK: - Haptics
    
    private func prepareHaptics() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            hapticEngine = try CHHapticEngine()
            try hapticEngine?.start()
        } catch {
            print("Haptic Engine Error: \(error.localizedDescription)")
        }
    }
    
    private func playHapticFeedback() {
        guard let engine = hapticEngine else { return }
        
        // Simple "gritty" grain haptic
        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.5)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
        let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0)
        
        do {
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            // Silently fail
        }
    }
}

#Preview {
    SandTrayView(
        store: Store(initialState: LiteracyFeature.State(
            level: LevelDefinition(id: "test", title: "Test", category: .literacy, targetValue: "a", biome: .forest)
        )) {
            LiteracyFeature()
        }
    )
}
