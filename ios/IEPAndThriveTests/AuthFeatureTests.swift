import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class AuthFeatureTests: XCTestCase {

    func test_canSubmit_requiresEmailAndPassword() async {
        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        }

        XCTAssertFalse(store.state.canSubmit)

        await store.send(.emailChanged("parent@example.com")) {
            $0.email = "parent@example.com"
        }
        XCTAssertFalse(store.state.canSubmit, "Email alone must not unlock submit.")

        await store.send(.passwordChanged("hunter2")) {
            $0.password = "hunter2"
        }
        XCTAssertTrue(store.state.canSubmit)
    }

    func test_canSubmit_treatsWhitespaceEmailAsEmpty() async {
        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        }

        await store.send(.emailChanged("   ")) { $0.email = "   " }
        await store.send(.passwordChanged("hunter2")) { $0.password = "hunter2" }
        XCTAssertFalse(store.state.canSubmit)
    }

    func test_modeToggle_flipsBetweenSignInAndSignUp() async {
        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        }

        XCTAssertEqual(store.state.mode, .signIn)

        await store.send(.modeToggled) { $0.mode = .signUp }
        await store.send(.modeToggled) { $0.mode = .signIn }
    }

    func test_modeToggle_clearsErrorMessage() async {
        let store = TestStore(
            initialState: AuthFeature.State(errorMessage: "Wrong password")
        ) {
            AuthFeature()
        }

        await store.send(.modeToggled) {
            $0.mode = .signUp
            $0.errorMessage = nil
        }
    }

    func test_submit_disabledWhenFormBlank_isNoOp() async {
        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signIn = { _, _ in
                XCTFail("signIn must not fire while form is invalid")
                return ""
            }
        }

        // No state change expected — submit gated on canSubmit.
        await store.send(.submitTapped)
    }

    func test_signIn_success_emitsDelegateAndDismisses() async {
        let received = Box<(String, String)?>(nil)
        let store = TestStore(
            initialState: AuthFeature.State(email: "parent@example.com", password: "hunter2")
        ) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signIn = { email, password in
                received.setValue((email, password))
                return "new-authed-uid"
            }
        }

        await store.send(.submitTapped) {
            $0.isSubmitting = true
        }
        await store.receive(\.authSucceeded) {
            $0.isSubmitting = false
        }
        await store.receive(\.delegate.signedIn)

        XCTAssertEqual(received.value?.0, "parent@example.com")
        XCTAssertEqual(received.value?.1, "hunter2")
    }

    func test_signIn_trimsWhitespaceFromEmail() async {
        let received = Box<String?>(nil)
        let store = TestStore(
            initialState: AuthFeature.State(
                email: "  parent@example.com  ",
                password: "hunter2"
            )
        ) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signIn = { email, _ in
                received.setValue(email)
                return "uid"
            }
        }

        await store.send(.submitTapped) { $0.isSubmitting = true }
        await store.receive(\.authSucceeded) { $0.isSubmitting = false }
        await store.receive(\.delegate.signedIn)

        XCTAssertEqual(received.value, "parent@example.com",
            "Trimmed email must reach AuthClient — not the raw text field.")
    }

    func test_signUp_routesToCreateUser() async {
        let signUpCalled = Box(false)
        let store = TestStore(
            initialState: AuthFeature.State(
                email: "new@example.com",
                password: "hunter2",
                mode: .signUp
            )
        ) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signIn = { _, _ in
                XCTFail("Sign-up flow must NOT call signIn")
                return ""
            }
            $0.authClient.signUp = { _, _ in
                signUpCalled.setValue(true)
                return "new-uid"
            }
        }

        await store.send(.submitTapped) { $0.isSubmitting = true }
        await store.receive(\.authSucceeded) { $0.isSubmitting = false }
        await store.receive(\.delegate.signedIn)

        XCTAssertTrue(signUpCalled.value)
    }

    func test_signIn_failure_surfacesErrorMessage() async {
        struct AuthError: Error, LocalizedError {
            var errorDescription: String? { "There is no user record corresponding to this email." }
        }
        let store = TestStore(
            initialState: AuthFeature.State(email: "parent@example.com", password: "wrong")
        ) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signIn = { _, _ in throw AuthError() }
        }

        await store.send(.submitTapped) { $0.isSubmitting = true }
        await store.receive(\.authFailed) {
            $0.isSubmitting = false
            $0.errorMessage = "There is no user record corresponding to this email."
        }
    }

    // MARK: - Sign in with Apple

    func test_apple_storesNonceFromOnRequest() async {
        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        }

        await store.send(.appleNonceGenerated("nonce-abc")) {
            $0.pendingAppleNonce = "nonce-abc"
        }
    }

    func test_apple_credentialReceived_exchangesForFirebaseUid() async {
        let captured = Box<(idToken: String, rawNonce: String)?>(nil)

        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signInWithApple = { idToken, nonce, _ in
                captured.setValue((idToken, nonce))
                return "apple-authed-uid"
            }
        }

        await store.send(.appleNonceGenerated("nonce-abc")) {
            $0.pendingAppleNonce = "nonce-abc"
        }
        await store.send(.appleCredentialReceived(idToken: "apple-id-token", fullName: nil)) {
            $0.isSubmitting = true
            $0.pendingAppleNonce = nil
        }
        await store.receive(\.authSucceeded) {
            $0.isSubmitting = false
        }
        await store.receive(\.delegate.signedIn)

        XCTAssertEqual(captured.value?.idToken, "apple-id-token")
        XCTAssertEqual(captured.value?.rawNonce, "nonce-abc",
            "Firebase must receive the RAW nonce, not the SHA-256 hash that went to Apple.")
    }

    func test_apple_credentialWithoutNonce_surfacesError() async {
        // Guard against a credential arriving before the nonce — would
        // mean SignInWithAppleButton skipped onRequest somehow. We must
        // NOT call authClient.signInWithApple without a nonce because
        // Firebase would reject the credential anyway.
        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signInWithApple = { _, _, _ in
                XCTFail("Must not exchange a credential without a stored nonce")
                return ""
            }
        }

        await store.send(.appleCredentialReceived(idToken: "tok", fullName: nil)) {
            $0.errorMessage = "Sign in with Apple did not start cleanly. Please try again."
        }
    }

    func test_apple_failure_clearsPendingNonce() async {
        struct AppleError: Error, LocalizedError {
            var errorDescription: String? { "Apple credential rejected by Firebase." }
        }

        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signInWithApple = { _, _, _ in throw AppleError() }
        }

        await store.send(.appleNonceGenerated("nonce")) {
            $0.pendingAppleNonce = "nonce"
        }
        await store.send(.appleCredentialReceived(idToken: "tok", fullName: nil)) {
            $0.isSubmitting = true
            $0.pendingAppleNonce = nil
        }
        await store.receive(\.authFailed) {
            $0.isSubmitting = false
            $0.errorMessage = "Apple credential rejected by Firebase."
        }
        // Both state.pendingAppleNonce and state.errorMessage land
        // as expected — nothing carrying over to a stale retry.
    }

    // MARK: - Sign in with Google

    func test_google_signInTapped_invokesClientAndEmitsDelegate() async {
        let called = Box(false)

        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signInWithGoogle = {
                called.setValue(true)
                return "google-authed-uid"
            }
        }

        await store.send(.googleSignInTapped) {
            $0.isSubmitting = true
        }
        await store.receive(\.authSucceeded) {
            $0.isSubmitting = false
        }
        await store.receive(\.delegate.signedIn)

        XCTAssertTrue(called.value)
    }

    func test_google_failure_surfacesErrorMessage() async {
        struct GoogleError: Error, LocalizedError {
            var errorDescription: String? { "Network error — try again." }
        }

        let store = TestStore(initialState: AuthFeature.State()) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signInWithGoogle = { throw GoogleError() }
        }

        await store.send(.googleSignInTapped) { $0.isSubmitting = true }
        await store.receive(\.authFailed) {
            $0.isSubmitting = false
            $0.errorMessage = "Network error — try again."
        }
    }

    func test_google_clearsExistingErrorOnRetry() async {
        // Tapping Google again after a failed attempt should clear the
        // previous error banner immediately so the user sees that a
        // new attempt is in flight.
        let store = TestStore(
            initialState: AuthFeature.State(errorMessage: "stale error")
        ) {
            AuthFeature()
        } withDependencies: {
            $0.authClient.signInWithGoogle = { "uid" }
        }

        await store.send(.googleSignInTapped) {
            $0.isSubmitting = true
            $0.errorMessage = nil
        }
        await store.receive(\.authSucceeded) { $0.isSubmitting = false }
        await store.receive(\.delegate.signedIn)
    }
}
