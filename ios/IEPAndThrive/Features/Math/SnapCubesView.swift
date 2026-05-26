import SwiftUI
import SpriteKit

/// SwiftUI wrapper around `SnapCubesScene`. Holds the scene as @State so
/// that the same scene survives view re-renders (otherwise the cubes
/// reset every time `currentCount` changes upstream).
struct SnapCubesView: View {
    let onCountChange: (Int) -> Void
    let onClear: () -> Void
    let onRemove: () -> Void

    @State private var scene: SnapCubesScene = {
        let scene = SnapCubesScene()
        scene.scaleMode = .resizeFill
        return scene
    }()

    var body: some View {
        VStack(spacing: 12) {
            SpriteView(scene: scene, options: [.allowsTransparency])
                .ignoresSafeArea(edges: .horizontal)
                .frame(maxWidth: .infinity)
                .frame(height: 320)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard))
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard)
                        .stroke(Theme.Colors.forest.opacity(0.15), lineWidth: 1)
                )
                .padding(.horizontal)

            HStack(spacing: 16) {
                Button {
                    scene.removeOneCube()
                } label: {
                    Label("Remove", systemImage: "minus.circle.fill")
                        .font(Theme.Fonts.body(size: 15, weight: .bold))
                        .foregroundColor(Theme.Colors.forest)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Theme.Colors.sagePale)
                        .clipShape(Capsule())
                }

                Button {
                    scene.clear()
                } label: {
                    Label("Clear", systemImage: "trash.fill")
                        .font(Theme.Fonts.body(size: 15, weight: .bold))
                        .foregroundColor(Theme.Colors.forest)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Theme.Colors.sagePale)
                        .clipShape(Capsule())
                }
            }
            .accessibilityElement(children: .contain)
        }
        .onAppear {
            scene.onCountChange = onCountChange
        }
    }
}
