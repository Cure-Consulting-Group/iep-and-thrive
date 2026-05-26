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
        case onAppear
        case volumeChanged(Double)
        case petTapped
        case exitTapped
    }
    
    @Dependency(\.audioClient) var audioClient
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                return .run { [volume = state.volume] _ in
                    await audioClient.play("ambient_forest.mp3", volume, true)
                }
                
            case let .volumeChanged(volume):
                state.volume = volume
                return .run { _ in
                    await audioClient.setVolume(volume)
                }
                
            case .petTapped:
                switch state.petMood {
                case .happy:
                    state.petMood = .playful
                case .playful:
                    state.petMood = .sleepy
                case .sleepy:
                    state.petMood = .happy
                }
                return .none

            case .exitTapped:
                return .run { _ in await audioClient.stop() }
            }
        }
    }
}
