import SwiftUI
import ComposableArchitecture

@main
struct IEPAndThriveApp: App {
    let store = Store(initialState: RootFeature.State()) {
        RootFeature()
            ._printChanges()
    }
    
    var body: some Scene {
        WindowGroup {
            RootView(store: store)
                .onAppear {
                    store.send(.appDelegate(.didFinishLaunching))
                }
        }
    }
}

struct RootView: View {
    let store: StoreOf<RootFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            NavigationStackStore(self.store.scope(state: \.path, action: \.path)) {
                if viewStore.isUserOnboarded {
                    JourneyView(store: self.store.scope(state: \.journey, action: \.journey))
                } else {
                    OnboardingView(store: self.store.scope(state: \.onboarding, action: \.onboarding))
                }
            } destination: { state in
                // ...
            }
            .sheet(
                store: self.store.scope(
                    state: \.$paywall,
                    action: \.paywall
                )
            ) { store in
                PaywallView(store: store)
            }
        }
    }
}
