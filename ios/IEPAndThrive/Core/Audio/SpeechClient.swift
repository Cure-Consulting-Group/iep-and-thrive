import Foundation
import AVFoundation
import ComposableArchitecture

public struct SpeechClient {
    public var speak: @Sendable (String) async -> Void
}

extension SpeechClient: DependencyKey {
    public static let liveValue = Self(
        speak: { text in
            let utterance = AVSpeechUtterance(string: text)
            utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
            utterance.rate = 0.5
            
            let synthesizer = AVSpeechSynthesizer()
            synthesizer.speak(utterance)
            
            // Note: In a production app, we'd handle the delegate to know when it finishes,
            // but for this MVP, a fire-and-forget speak is sufficient.
        }
    )
    
    public static let testValue = Self(
        speak: { _ in }
    )
}

extension DependencyValues {
    public var speechClient: SpeechClient {
        get { self[SpeechClient.self] }
        set { self[SpeechClient.self] = newValue }
    }
}
