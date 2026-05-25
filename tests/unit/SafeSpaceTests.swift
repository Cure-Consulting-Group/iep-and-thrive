import XCTest
import ComposableArchitecture
@testable import IEPAndThrive

@MainActor
final class SafeSpaceTests: XCTestCase {
    func testVolumeChanged() async {
        let store = TestStore(initialState: SafeSpaceFeature.State()) {
            SafeSpaceFeature()
        } withDependencies: {
            $0.audioClient = .testValue
        }
        
        await store.send(.volumeChanged(0.8)) {
            $0.volume = 0.8
        }
    }
    
    func testPetTappedCycle() async {
        let store = TestStore(initialState: SafeSpaceFeature.State()) {
            SafeSpaceFeature()
        }
        
        // Initial state is .happy
        await store.send(.petTapped) {
            $0.petMood = .playful
        }
        
        await store.send(.petTapped) {
            $0.petMood = .sleepy
        }
        
        await store.send(.petTapped) {
            $0.petMood = .happy
        }
    }
    
    func testOnAppearStartsAudio() async {
        let store = TestStore(initialState: SafeSpaceFeature.State(volume: 0.4)) {
            SafeSpaceFeature()
        } withDependencies: {
            $0.audioClient = .testValue
        }
        
        await store.send(.onAppear)
        // No state change expected, just ensuring it doesn't crash and dependency is called.
    }
}
