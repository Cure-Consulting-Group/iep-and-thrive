import SwiftUI
import ComposableArchitecture
import FirebaseCore
import GoogleSignIn

@main
struct IEPAndThriveApp: App {
    init() {
        // Loads GoogleService-Info.plist from the bundle and configures
        // FirebaseAuth + FirebaseFirestore against the iep-and-thrive
        // project. Must run before any Auth / Firestore calls.
        FirebaseApp.configure()
    }

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
                // Google Sign-In's OAuth flow ends with the browser
                // calling back into the app via our REVERSED_CLIENT_ID
                // URL scheme. GIDSignIn picks up the token here.
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
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
                switch state {
                case .literacy:
                    CaseLet(
                        /RootFeature.Path.State.literacy,
                        action: RootFeature.Path.Action.literacy,
                        then: LiteracyView.init(store:)
                    )
                case .math:
                    CaseLet(
                        /RootFeature.Path.State.math,
                        action: RootFeature.Path.Action.math,
                        then: MathView.init(store:)
                    )
                case .safeSpace:
                    CaseLet(
                        /RootFeature.Path.State.safeSpace,
                        action: RootFeature.Path.Action.safeSpace,
                        then: SafeSpaceView.init(store:)
                    )
                }
            }
            .sheet(
                store: self.store.scope(
                    state: \.$paywall,
                    action: \.paywall
                )
            ) { store in
                PaywallView(store: store)
            }
            .sheet(
                store: self.store.scope(
                    state: \.$auth,
                    action: \.auth
                )
            ) { store in
                AuthView(store: store)
            }
        }
    }
}
