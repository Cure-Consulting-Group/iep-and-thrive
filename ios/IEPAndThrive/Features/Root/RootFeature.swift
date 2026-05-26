import ComposableArchitecture
import SwiftUI

@Reducer
struct RootFeature {
    struct State: Equatable {
        var journey = JourneyFeature.State()
        var onboarding = OnboardingFeature.State()
        @PresentationState var paywall: PaywallFeature.State?
        var path = StackState<Path.State>()
        
        var isUserOnboarded: Bool = false
        var isPremium: Bool = false
    }
    
    enum Action {
        case journey(JourneyFeature.Action)
        case onboarding(OnboardingFeature.Action)
        case paywall(PresentationAction<PaywallFeature.Action>)
        case path(StackAction<Path.State, Path.Action>)
        case appDelegate(AppDelegateAction)
        case profileLoaded(StudentProfile?)
        case subscriptionStatusChanged(Bool)
    }
    
    enum AppDelegateAction {
        case didFinishLaunching
    }
    
    @Dependency(\.database) var database
    @Dependency(\.storeKit) var storeKit
    
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
                    
                    for await isPremium in await storeKit.observeStatus() {
                        await send(.subscriptionStatusChanged(isPremium))
                    }
                }
                
            case let .profileLoaded(profile):
                state.isUserOnboarded = (profile != nil)
                if state.isUserOnboarded && !state.isPremium {
                    state.paywall = PaywallFeature.State()
                }
                return .none
                
            case let .subscriptionStatusChanged(isPremium):
                state.isPremium = isPremium
                if isPremium {
                    state.paywall = nil
                }
                return .none
                
            case .onboarding(.onboardingComplete):
                state.isUserOnboarded = true
                if !state.isPremium {
                    state.paywall = PaywallFeature.State()
                }
                return .none
                
            case let .journey(.levelPreview(.presented(.startButtonTapped(level)))):
                state.journey.levelPreview = nil
                switch level.category {
                case .literacy:
                    state.path.append(Path.State.literacy(LiteracyFeature.State(level: level)))
                case .math:
                    state.path.append(Path.State.math(MathFeature.State(level: level)))
                }
                return .none
                
            case let .path(.element(id: _, action: .literacy(.doneTapped))):
                if case let .literacy(literacyState) = state.path.last {
                    state.path.removeLast()
                    return .send(.journey(.missionComplete(literacyState.level)))
                }
                return .none
                
            case let .path(.element(id: _, action: .math(.checkAnswerTapped))):
                // Simplified for MVP: tapping check answer acts as done
                if case let .math(mathState) = state.path.last {
                    state.path.removeLast()
                    return .send(.journey(.missionComplete(mathState.level)))
                }
                return .none

            case .journey, .onboarding, .path, .paywall:
                return .none
            }
        }
        .ifLet(\.$paywall, action: \.paywall) {
            PaywallFeature()
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
