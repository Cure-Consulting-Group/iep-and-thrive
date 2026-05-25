import ComposableArchitecture
import SwiftUI

@Reducer
struct OnboardingFeature {
    struct State: Equatable {
        var childName: String = ""
        var age: Int?
        var primaryFocus: FocusType = .reading
        
        enum FocusType: String, Equatable {
            case reading, math, both
        }
    }
    
    enum Action {
        case nameChanged(String)
        case ageSelected(Int)
        case focusSelected(State.FocusType)
        case continueTapped
        case onboardingComplete
    }
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .nameChanged(name):
                state.childName = name
                return .none
            case let .ageSelected(age):
                state.age = age
                return .none
            case let .focusSelected(focus):
                state.primaryFocus = focus
                return .none
            case .continueTapped:
                return .send(.onboardingComplete)
            case .onboardingComplete:
                return .none
            }
        }
    }
}
