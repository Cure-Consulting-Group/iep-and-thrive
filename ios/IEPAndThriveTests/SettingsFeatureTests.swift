import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class SettingsFeatureTests: XCTestCase {

    func test_uidDisplay_truncatesLongUid() {
        let state = SettingsFeature.State(uid: "abcdef0123456789-very-long-firebase-uid")
        XCTAssertEqual(state.uidDisplay, "Account ID: abcdef01")
    }

    func test_uidDisplay_anonymousWhenNil() {
        let state = SettingsFeature.State(uid: nil)
        XCTAssertEqual(state.uidDisplay, "Anonymous")
    }

    func test_uidDisplay_anonymousWhenEmpty() {
        let state = SettingsFeature.State(uid: "")
        XCTAssertEqual(state.uidDisplay, "Anonymous")
    }

    func test_signOutTapped_callsAuthClientAndEmitsDelegate() async {
        let signedOut = Box(false)

        let store = TestStore(
            initialState: SettingsFeature.State(uid: "authed-uid")
        ) {
            SettingsFeature()
        } withDependencies: {
            $0.authClient.signOut = {
                signedOut.setValue(true)
            }
        }
        // The reducer fires .delegate + dismisses — we just want to
        // confirm the chain.
        store.exhaustivity = .off

        await store.send(.signOutTapped) { $0.isSigningOut = true }
        await store.receive(\.signOutSucceeded) { $0.isSigningOut = false }
        await store.receive(\.delegate.signedOut)

        XCTAssertTrue(signedOut.value)
    }

    func test_signOut_failure_surfacesErrorMessage() async {
        struct SignOutError: Error, LocalizedError {
            var errorDescription: String? { "No keychain access." }
        }

        let store = TestStore(
            initialState: SettingsFeature.State(uid: "authed-uid")
        ) {
            SettingsFeature()
        } withDependencies: {
            $0.authClient.signOut = { throw SignOutError() }
        }

        await store.send(.signOutTapped) { $0.isSigningOut = true }
        await store.receive(\.signOutFailed) {
            $0.isSigningOut = false
            $0.errorMessage = "No keychain access."
        }
    }
}
