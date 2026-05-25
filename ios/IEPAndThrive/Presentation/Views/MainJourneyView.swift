import SwiftUI

struct MainJourneyView: View {
    @State private var viewModel = JourneyViewModel()
    
    var body: some View {
        ZStack {
            Theme.Colors.cream.ignoresSafeArea()
            
            ScrollView([.horizontal, .vertical]) {
                ZStack {
                    // Journey Path (Background)
                    Path { path in
                        path.move(to: CGPoint(x: 100, y: 100))
                        path.addLine(to: CGPoint(x: 200, y: 300))
                    }
                    .stroke(Theme.Colors.sage, style: StrokeStyle(lineWidth: 4, lineCap: .round, dash: [10]))
                    
                    // Nodes
                    ForEach(viewModel.nodes) { node in
                        NodeView(node: node) {
                            viewModel.selectNode(node)
                        }
                        .position(node.position)
                    }
                }
                .frame(width: 1000, height: 2000) // Large canvas for the journey
            }
        }
    }
}

struct NodeView: View {
    let node: JourneyNode
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack {
                ZStack {
                    Circle()
                        .fill(backgroundColor)
                        .frame(width: 80, height: 80)
                        .shadow(
                            color: Theme.Layout.shadowCard.0,
                            radius: Theme.Layout.shadowCard.1,
                            x: Theme.Layout.shadowCard.2,
                            y: Theme.Layout.shadowCard.3
                        )
                    
                    icon
                }
                
                Text(node.title)
                    .font(Theme.Fonts.body(size: 14, weight: .bold))
                    .foregroundColor(Theme.Colors.text)
                    .padding(.top, 4)
            }
        }
        .disabled(node.status == .locked)
        .opacity(node.status == .locked ? 0.5 : 1.0)
    }
    
    private var backgroundColor: Color {
        switch node.type {
        case .literacy: return Theme.Colors.forest
        case .numeracy: return Theme.Colors.amber
        case .sel: return Theme.Colors.forestLight
        case .reward: return Theme.Colors.sage
        }
    }
    
    private var icon: some View {
        Group {
            switch node.type {
            case .literacy:
                Image(systemName: "book.fill")
            case .numeracy:
                Image(systemName: "plus.forwardslash.minus")
            case .sel:
                Image(systemName: "heart.fill")
            case .reward:
                Image(systemName: "star.fill")
            }
        }
        .foregroundColor(.white)
        .font(.system(size: 30))
    }
}

#Preview {
    MainJourneyView()
}
