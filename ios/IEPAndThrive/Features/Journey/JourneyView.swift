import SwiftUI
import ComposableArchitecture

struct JourneyView: View {
    let store: StoreOf<JourneyFeature>

    private let nodeSpacing: CGFloat = 120
    private let canvasWidth: CGFloat = 300

    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                ScrollView(.vertical, showsIndicators: false) {
                    ZStack(alignment: .top) {
                        // Biome backgrounds, ordered by the first level that uses each biome
                        VStack(spacing: 0) {
                            ForEach(orderedBiomes(in: viewStore.levels), id: \.self) { biome in
                                BiomeSection(biome: biome)
                            }
                        }

                        // Connecting trail behind the nodes
                        TrailPath(
                            nodeCount: viewStore.levels.count,
                            spacing: nodeSpacing,
                            canvasWidth: canvasWidth,
                            offsetFor: offsetForIndex
                        )
                        .stroke(
                            Theme.Colors.sage,
                            style: StrokeStyle(lineWidth: 6, lineCap: .round, dash: [12, 14])
                        )
                        .padding(.top, 200)
                        .padding(.bottom, 200)

                        // Nodes themselves
                        VStack(spacing: nodeSpacing) {
                            ForEach(Array(viewStore.levels.enumerated()), id: \.element.id) { index, level in
                                JourneyNodeView(
                                    level: index + 1,
                                    isActive: index == viewStore.currentLevelIndex,
                                    isUnlocked: index <= viewStore.currentLevelIndex,
                                    isCompleted: index < viewStore.currentLevelIndex
                                ) {
                                    viewStore.send(.nodeTapped(level))
                                }
                                .offset(x: offsetForIndex(index))
                            }
                        }
                        .padding(.vertical, 200)
                    }
                    .frame(maxWidth: .infinity)
                }
                .background(Theme.Colors.cream)
                .onAppear { viewStore.send(.onAppear) }

                // Floating UI Overlays
                VStack {
                    HStack {
                        Button {
                            viewStore.send(.settingsTapped)
                        } label: {
                            Image(systemName: "gearshape")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundColor(Theme.Colors.forestMid)
                                .padding(10)
                                .background(Color.white.opacity(0.8))
                                .clipShape(Circle())
                                .accessibilityLabel("Parent settings")
                        }
                        .padding(.leading, 16)
                        .padding(.top, 16)
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
                                .accessibilityLabel("Open Safe Space")
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
            .sheet(
                store: self.store.scope(
                    state: \.$missionComplete,
                    action: \.missionCompleteSheet
                )
            ) { store in
                MissionCompleteView(store: store)
                    .presentationDetents([.medium])
                    .presentationDragIndicator(.visible)
            }
        }
    }

    private func offsetForIndex(_ index: Int) -> CGFloat {
        CGFloat(sin(Double(index) * 0.8) * 100)
    }

    private func orderedBiomes(in levels: [LevelDefinition]) -> [LevelDefinition.Biome] {
        var seen: Set<LevelDefinition.Biome> = []
        var ordered: [LevelDefinition.Biome] = []
        for level in levels where seen.insert(level.biome).inserted {
            ordered.append(level.biome)
        }
        return ordered
    }
}

struct TrailPath: Shape {
    let nodeCount: Int
    let spacing: CGFloat
    let canvasWidth: CGFloat
    let offsetFor: (Int) -> CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()
        guard nodeCount > 0 else { return path }
        let centerX = rect.width / 2
        for index in 0..<nodeCount {
            let x = centerX + offsetFor(index)
            let y = CGFloat(index) * spacing
            if index == 0 {
                path.move(to: CGPoint(x: x, y: y))
            } else {
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        return path
    }
}

struct BiomeSection: View {
    let biome: LevelDefinition.Biome

    var body: some View {
        ZStack {
            // Forest art is the only real asset today; tint per biome for visual differentiation.
            // When desert/mountain art lands, swap to per-biome imageName.
            Image("BiomeForest")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(height: 1000)
                .clipped()
                .overlay(tintOverlay)

            Text(biome.displayTitle)
                .font(Theme.Fonts.display(size: 40))
                .foregroundColor(Theme.Colors.forest.opacity(0.5))
                .shadow(color: .white, radius: 2)
        }
    }

    private var tintOverlay: some View {
        LinearGradient(
            colors: biome.tintGradient,
            startPoint: .top,
            endPoint: .bottom
        )
        .blendMode(.multiply)
        .opacity(0.55)
    }
}

extension LevelDefinition.Biome {
    var displayTitle: String {
        switch self {
        case .forest:   return "The Whispering Woods"
        case .desert:   return "The Golden Dunes"
        case .mountain: return "The Snowy Peaks"
        }
    }

    var tintGradient: [Color] {
        switch self {
        case .forest:
            return [Color(hex: "B7E4C7").opacity(0.0), Color(hex: "1B4332").opacity(0.4)]
        case .desert:
            return [Color(hex: "FFF3CD").opacity(0.4), Color(hex: "D4860B").opacity(0.6)]
        case .mountain:
            return [Color(hex: "E0F2FE").opacity(0.5), Color(hex: "475569").opacity(0.7)]
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
                .contentTransition(.numericText(value: Double(count)))
                .animation(.easeInOut, value: count)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Theme.Colors.amber)
        .clipShape(Capsule())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(count) sparks earned")
    }
}

struct JourneyNodeView: View {
    let level: Int
    let isActive: Bool
    let isUnlocked: Bool
    let isCompleted: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(fillColor)
                    .frame(width: 80, height: 80)
                    .shadow(color: Theme.Colors.forest.opacity(0.15), radius: 4, x: 0, y: 2)

                if isActive {
                    Circle()
                        .stroke(Theme.Colors.forestLight, lineWidth: 4)
                        .frame(width: 90, height: 90)
                }

                content
            }
        }
        .disabled(!isUnlocked)
        .accessibilityLabel(accessibilityText)
    }

    private var fillColor: Color {
        if isCompleted { return Theme.Colors.forestLight }
        if isUnlocked  { return Theme.Colors.forest }
        return Theme.Colors.textMuted.opacity(0.6)
    }

    @ViewBuilder
    private var content: some View {
        if isCompleted {
            Image(systemName: "checkmark")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
        } else if !isUnlocked {
            Image(systemName: "lock.fill")
                .font(.system(size: 24))
                .foregroundColor(.white.opacity(0.85))
        } else {
            Text("\(level)")
                .font(Theme.Fonts.display(size: 24))
                .foregroundColor(.white)
        }
    }

    private var accessibilityText: String {
        if isCompleted { return "Level \(level), completed" }
        if isUnlocked  { return "Level \(level), ready to start" }
        return "Level \(level), locked"
    }
}
