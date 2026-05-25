import Foundation
import AVFoundation
import ComposableArchitecture

struct AudioClient {
    var play: @Sendable (String, Double, Bool) async -> Void
    var stop: @Sendable () async -> Void
    var setVolume: @Sendable (Double) async -> Void
}

extension AudioClient: DependencyKey {
    static let liveValue: AudioClient = {
        let manager = AudioManager()
        return Self(
            play: { filename, volume, loop in
                await manager.play(filename: filename, volume: volume, loop: loop)
            },
            stop: {
                await manager.stop()
            },
            setVolume: { volume in
                await manager.setVolume(volume)
            }
        )
    }()
    
    static let testValue = Self(
        play: { _, _, _ in },
        stop: { },
        setVolume: { _ in }
    )
}

private actor AudioManager {
    var player: AVAudioPlayer?

    func play(filename: String, volume: Double, loop: Bool) {
        // Attempt to find the file in the main bundle. 
        // We'll use a variety of common extensions if one isn't provided.
        let name = (filename as NSString).deletingPathExtension
        let ext = (filename as NSString).pathExtension.isEmpty ? "mp3" : (filename as NSString).pathExtension
        
        guard let url = Bundle.main.url(forResource: name, withExtension: ext) else {
            print("Audio file not found: \(filename)")
            return
        }
        
        do {
            player = try AVAudioPlayer(contentsOf: url)
            player?.volume = Float(volume)
            player?.numberOfLoops = loop ? -1 : 0
            player?.prepareToPlay()
            player?.play()
        } catch {
            print("Failed to play sound: \(error)")
        }
    }

    func stop() {
        player?.stop()
        player = nil
    }

    func setVolume(_ volume: Double) {
        player?.volume = Float(volume)
    }
}

extension DependencyValues {
    var audioClient: AudioClient {
        get { self[AudioClient.self] }
        set { self[AudioClient.self] = newValue }
    }
}
