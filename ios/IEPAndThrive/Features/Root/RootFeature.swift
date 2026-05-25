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
        case profileLoaded(StudentProfile?)
    }
    
    enum AppDelegateAction {
        case didFinishLaunching
    }
    
    @Dependency(\.database) var database
    
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
                return .run { send in
                    let profile = try? await database.fetchProfile()
                    await send(.profileLoaded(profile))
                }
                
            case let .profileLoaded(profile):
                state.isUserOnboarded = (profile != nil)
                return .none
                
            case .onboarding(.onboardingComplete):
                // In a real app, the onboarding feature would have already saved the profile
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
