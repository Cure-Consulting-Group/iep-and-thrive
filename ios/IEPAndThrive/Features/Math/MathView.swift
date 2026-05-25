import SwiftUI
import ComposableArchitecture

struct MathView: View {
    let store: StoreOf<MathFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.creamDeep.ignoresSafeArea()
                
                VStack {
                    Text(viewStore.equation)
                        .font(Theme.Fonts.display(size: 40))
                        .padding()
                    
                    Spacer()
                    
                    // Physics Tray Placeholder
                    HStack {
                        ForEach(0..<viewStore.currentCount, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Theme.Colors.amber)
                                .frame(width: 50, height: 50)
                        }
                    }
                    
                    Spacer()
                    
                    Button("Check Answer") {
                        viewStore.send(.checkAnswerTapped)
                    }
                    .padding()
                    .background(Theme.Colors.forest)
                    .foregroundColor(.white)
                    .clipShape(Capsule())
                }
            }
        }
    }
}
