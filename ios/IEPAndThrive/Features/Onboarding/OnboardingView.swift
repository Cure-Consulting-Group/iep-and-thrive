import SwiftUI
import ComposableArchitecture

struct OnboardingView: View {
    let store: StoreOf<OnboardingFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.cream.ignoresSafeArea()
                
                VStack(spacing: 30) {
                    Text("Welcome, Parent!")
                        .font(Theme.Fonts.display(size: 34))
                        .foregroundColor(Theme.Colors.forest)
                    
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Child's First Name")
                            .font(Theme.Fonts.body(size: 14, weight: .bold))
                        TextField("Name", text: viewStore.binding(get: \.childName, send: OnboardingFeature.Action.nameChanged))
                            .padding()
                            .background(Color.white)
                            .cornerRadius(10)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.Colors.forest, lineWidth: 1))
                    }
                    .padding(.horizontal)
                    
                    Button {
                        viewStore.send(.continueTapped)
                    } label: {
                        Text("Continue")
                            .font(Theme.Fonts.body(size: 18, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Theme.Colors.forest)
                            .clipShape(Capsule())
                    }
                    .padding(.horizontal)
                }
            }
        }
    }
}
