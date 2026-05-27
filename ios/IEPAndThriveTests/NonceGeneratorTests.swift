import XCTest
@testable import IEPAndThrive

/// Sanity tests for the SIWA nonce helpers. The Sign in with Apple flow
/// is brittle under bad nonces — Firebase silently rejects the
/// credential exchange — so we guard the basics here.
final class NonceGeneratorTests: XCTestCase {

    func test_random_returnsRequestedLength() {
        XCTAssertEqual(NonceGenerator.random(length: 32).count, 32)
        XCTAssertEqual(NonceGenerator.random(length: 64).count, 64)
    }

    func test_random_returnsDifferentValuesAcrossCalls() {
        // Birthday-paradox-y but with 64+ bits of entropy two calls
        // should never collide in practice.
        let a = NonceGenerator.random()
        let b = NonceGenerator.random()
        XCTAssertNotEqual(a, b)
    }

    func test_random_charactersAreFromExpectedAlphabet() {
        let allowed = Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._")
        let nonce = NonceGenerator.random(length: 64)
        for ch in nonce {
            XCTAssertTrue(allowed.contains(ch),
                "Nonce contained unexpected character: \(ch)")
        }
    }

    func test_sha256_isDeterministicAndHex() {
        // RFC 6234 / known SHA-256 of "abc"
        let expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        XCTAssertEqual(NonceGenerator.sha256("abc"), expected)
    }

    func test_sha256_differsForDifferentInputs() {
        XCTAssertNotEqual(NonceGenerator.sha256("nonce-a"),
                          NonceGenerator.sha256("nonce-b"))
    }
}
