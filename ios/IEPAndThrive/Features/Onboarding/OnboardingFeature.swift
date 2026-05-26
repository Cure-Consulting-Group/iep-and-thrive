import ComposableArchitecture
import SwiftUI

@Reducer
struct OnboardingFeature {
    struct State: Equatable {
        var childName: String = ""
        var age: Int = 7
        var primaryFocus: FocusType = .reading

        var trimmedName: String {
            childName.trimmingCharacters(in: .whitespacesAndNewlines)
        }

        var canContinue: Bool {
            !trimmedName.isEmpty
        }

        enum FocusType: String, Equatable, CaseIterable, Identifiable {
            case reading, math, both
            var id: String { rawValue }

            var displayName: String {
                switch self {
                case .reading: return "Reading"
                case .math:    return "Math"
                case .both:    return "Both"
                }
            }
        }
    }

    enum Action {
        case nameChanged(String)
        case ageSelected(Int)
        case focusSelected(State.FocusType)
        case continueTapped
        case profileSaved
        case onboardingComplete
    }

    @Dependency(\.database) var database

    static let ageRange: ClosedRange<Int> = 5...11

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
                guard state.canContinue else { return .none }
                let profile = StudentProfile(
                    firstName: state.trimmedName,
                    age: state.age,
                    primaryFocus: state.primaryFocus.rawValue
                )
                return .run { send in
                    try? await database.saveProfile(profile)
                    await send(.profileSaved)
                }
            case .profileSaved:
                return .send(.onboardingComplete)
            case .onboardingComplete:
                return .none
            }
        }
    }
}
