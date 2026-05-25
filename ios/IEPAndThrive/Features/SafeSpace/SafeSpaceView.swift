import SwiftUI
import ComposableArchitecture

struct SafeSpaceView: View {
    let store: StoreOf<SafeSpaceFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.sagePale.ignoresSafeArea()
                
                VStack {
                    Text("Safe Space")
                        .font(Theme.Fonts.display(size: 32))
                        .padding()
                    
                    Spacer()
                    
                    // Pet Placeholder
                    Circle()
                        .fill(Theme.Colors.cream)
                        .frame(width: 200, height: 200)
                        .overlay(Text("🐶").font(.system(size: 100)))
                        .onTapGesture {
                            viewStore.send(.petTapped)
                        }
                    
                    Spacer()
                    
                    Slider(value: viewStore.binding(get: \.volume, send: SafeSpaceFeature.Action.volumeChanged))
                        .padding()
                }
            }
        }
    }
}
