import CryptoKit
import Foundation

/// Apple's Sign in with Apple flow uses a replay-protection nonce: we
/// pass the SHA-256 *hash* of a random string to Apple, and the raw
/// string to Firebase. Firebase verifies the hash matches the token's
/// claim before completing the credential exchange.
enum NonceGenerator {
    /// Generates a 32-character alphanumeric nonce drawn from `SecRandom`.
    /// Used as the raw value handed to Firebase via `OAuthProvider`.
    static func random(length: Int = 32) -> String {
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remaining = length
        while remaining > 0 {
            var randoms = [UInt8](repeating: 0, count: 16)
            let status = SecRandomCopyBytes(kSecRandomDefault, randoms.count, &randoms)
            precondition(status == errSecSuccess, "Unable to generate secure random bytes")
            for byte in randoms where remaining > 0 {
                if byte < charset.count {
                    result.append(charset[Int(byte)])
                    remaining -= 1
                }
            }
        }
        return result
    }

    /// SHA-256 of the raw nonce, hex-encoded. This is what Apple sees on
    /// the SIWA request.
    static func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.map { String(format: "%02x", $0) }.joined()
    }
}
