import SwiftUI
import ComposableArchitecture

struct LiteracyView: View {
    let store: StoreOf<LiteracyFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.creamDeep.ignoresSafeArea()
                
                VStack {
                    Text("Trace the letter \(viewStore.currentLetter)")
                        .font(Theme.Fonts.display(size: 28))
                        .padding()
                    
                    Spacer()
                    
                    // Sand Tray Placeholder
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.orange.opacity(0.1))
                        .overlay(
                            Text(viewStore.currentLetter)
                                .font(.system(size: 200, weight: .thin))
                                .foregroundColor(.gray.opacity(0.3))
                        )
                        .padding()
                    
                    Spacer()
                    
                    Button("Done") {
                        viewStore.send(.doneTapped)
                    }
                    .padding()
                    .background(Theme.Colors.sage)
                    .foregroundColor(.white)
                    .clipShape(Capsule())
                }
            }
        }
    }
}
