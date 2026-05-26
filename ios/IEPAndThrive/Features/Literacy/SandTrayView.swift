import SwiftUI
import ComposableArchitecture
import CoreHaptics

struct SandTrayView: View {
    let store: StoreOf<LiteracyFeature>

    @State private var strokes: [[CGPoint]] = []
    @State private var currentStroke: [CGPoint] = []
    @State private var hapticEngine: CHHapticEngine?

    /// Captured canvas size from GeometryReader so the tracer can build a
    /// path in the same coordinate space as the drag gesture.
    @State private var canvasSize: CGSize = .zero

    private let letterFontSize: CGFloat = 300

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                RoundedRectangle(cornerRadius: 30)
                    .stroke(Theme.Colors.forest, lineWidth: 15)
                    .background(
                        Image("SandTexture")
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 30))
                    .padding(20)

                GeometryReader { geo in
                    ZStack {
                        Text(viewStore.currentLetter)
                            .font(.system(size: letterFontSize, weight: .thin, design: .rounded))
                            .foregroundColor(Theme.Colors.forest.opacity(0.1))
                            .accessibilityHidden(true)

                        Canvas { context, _ in
                            let strokeColor = viewStore.isTracingComplete
                                ? Theme.Colors.forestLight.opacity(0.5)
                                : Theme.Colors.forest.opacity(0.3)
                            for stroke in strokes {
                                var path = Path()
                                path.addLines(stroke)
                                context.stroke(
                                    path,
                                    with: .color(strokeColor),
                                    style: StrokeStyle(lineWidth: 25, lineCap: .round, lineJoin: .round)
                                )
                            }

                            if !currentStroke.isEmpty {
                                var path = Path()
                                path.addLines(currentStroke)
                                context.stroke(
                                    path,
                                    with: .color(strokeColor),
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
                                    evaluateStrokes(viewStore: viewStore)
                                }
                        )
                    }
                    .onAppear { canvasSize = geo.size }
                    .onChange(of: geo.size) { _, newValue in canvasSize = newValue }
                }
                .padding(40)

                VStack {
                    HStack {
                        Button {
                            viewStore.send(.speakLetterTapped)
                        } label: {
                            Image(systemName: "speaker.wave.2.circle.fill")
                                .font(.system(size: 44))
                                .foregroundColor(Theme.Colors.forest)
                                .accessibilityLabel("Hear the letter")
                        }
                        .padding(40)

                        Spacer()

                        Button {
                            clearStrokes(viewStore: viewStore)
                        } label: {
                            Image(systemName: "arrow.counterclockwise.circle.fill")
                                .font(.system(size: 44))
                                .foregroundColor(Theme.Colors.forest)
                                .accessibilityLabel("Clear and start over")
                        }
                        .padding(40)
                    }

                    if viewStore.showTraceHint {
                        Text("Try tracing along the letter shape.")
                            .font(Theme.Fonts.body(size: 14, weight: .bold))
                            .foregroundColor(Theme.Colors.amber)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Theme.Colors.amberLight)
                            .clipShape(Capsule())
                            .transition(.opacity)
                    }

                    Spacer()

                    HStack {
                        Spacer()
                        Button {
                            viewStore.send(.doneTapped)
                        } label: {
                            HStack(spacing: 8) {
                                if viewStore.isTracingComplete {
                                    Image(systemName: "checkmark.circle.fill")
                                }
                                Text(viewStore.isTracingComplete ? "Great Job!" : "Done")
                            }
                            .font(Theme.Fonts.body(size: 20, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 40)
                            .padding(.vertical, 15)
                            .background(viewStore.isTracingComplete ? Theme.Colors.forestLight : Theme.Colors.sage)
                            .clipShape(Capsule())
                        }
                        .padding(40)
                    }
                }
                .animation(.easeInOut, value: viewStore.isTracingComplete)
                .animation(.easeInOut, value: viewStore.showTraceHint)
            }
            .onAppear(perform: prepareHaptics)
        }
    }

    private func evaluateStrokes(viewStore: ViewStoreOf<LiteracyFeature>) {
        guard canvasSize.width > 0, canvasSize.height > 0 else { return }
        let tracer = LetterTracer(
            target: viewStore.currentLetter,
            canvasSize: canvasSize,
            fontPointSize: letterFontSize
        )
        let result = tracer.evaluate(strokes: strokes)
        viewStore.send(.tracingEnded(result.isPass))
    }

    private func clearStrokes(viewStore: ViewStoreOf<LiteracyFeature>) {
        strokes = []
        currentStroke = []
        viewStore.send(.tracingEnded(false))
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
