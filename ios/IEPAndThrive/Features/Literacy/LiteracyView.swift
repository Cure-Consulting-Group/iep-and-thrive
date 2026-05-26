import SwiftUI
import ComposableArchitecture

struct LiteracyView: View {
    let store: StoreOf<LiteracyFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.cream.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button {
                            viewStore.send(.backTapped)
                        } label: {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(Theme.Colors.forest)
                                .accessibilityLabel("Back to journey")
                        }
                        
                        Spacer()
                        
                        Text("Literacy: Letter Sounds")
                            .font(Theme.Fonts.display(size: 24))
                            .foregroundColor(Theme.Colors.forest)
                        
                        Spacer()
                        
                        // Placeholder for progress or sparks
                        Circle()
                            .fill(Theme.Colors.amber)
                            .frame(width: 32, height: 32)
                    }
                    .padding()
                    
                    Text("Trace the letter \(viewStore.currentLetter)")
                        .font(Theme.Fonts.body(size: 20, weight: .medium))
                        .foregroundColor(Theme.Colors.textMuted)
                        .padding(.bottom)
                    
                    // The Interactive Module
                    SandTrayView(store: store)
                }
            }
        }
    }
}
