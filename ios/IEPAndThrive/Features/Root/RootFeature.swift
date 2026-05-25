import ComposableArchitecture
import SwiftUI

@Reducer
struct RootFeature {
    struct State: Equatable {
        var journey = JourneyFeature.State()
        var onboarding = OnboardingFeature.State()
        var path = StackState<Path.State>()
        
        var isUserOnboarded: Bool = false
    }
    
    enum Action {
        case journey(JourneyFeature.Action)
        case onboarding(OnboardingFeature.Action)
        case path(StackAction<Path.State, Path.Action>)
        case appDelegate(AppDelegateAction)
    }
    
    enum AppDelegateAction {
        case didFinishLaunching
    }
    
    var body: some ReducerOf<Self> {
        Scope(state: \.journey, action: \.journey) {
            JourneyFeature()
        }
        
        Scope(state: \.onboarding, action: \.onboarding) {
            OnboardingFeature()
        }
        
        Reduce { state, action in
            switch action {
            case .appDelegate(.didFinishLaunching):
                // Logic to check if user is onboarded via SwiftData/UserDefaults
                return .none
                
            case .onboarding(.onboardingComplete):
                state.isUserOnboarded = true
                return .none
                
            case .journey, .onboarding, .path:
                return .none
            }
        }
        .forEach(\.path, action: \.path) {
            Path()
        }
    }
    
    @Reducer
    struct Path {
        enum State: Equatable {
            case literacy(LiteracyFeature.State)
            case math(MathFeature.State)
            case safeSpace(SafeSpaceFeature.State)
        }
        
        enum Action {
            case literacy(LiteracyFeature.Action)
            case math(MathFeature.Action)
            case safeSpace(SafeSpaceFeature.Action)
        }
        
        var body: some ReducerOf<Self> {
            Scope(state: /State.literacy, action: /Action.literacy) {
                LiteracyFeature()
            }
            Scope(state: /State.math, action: /Action.math) {
                MathFeature()
            }
            Scope(state: /State.safeSpace, action: /Action.safeSpace) {
                SafeSpaceFeature()
            }
        }
    }
}
