import ComposableArchitecture
import SwiftUI

@Reducer
struct SafeSpaceFeature {
    struct State: Equatable {
        var volume: Double = 0.5
        var petMood: PetMood = .happy
        
        enum PetMood: Equatable {
            case happy, playful, sleepy
        }
    }
    
    enum Action {
        case volumeChanged(Double)
        case petTapped
    }
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .volumeChanged(volume):
                state.volume = volume
                return .none
            case .petTapped:
                return .none
            }
        }
    }
}
