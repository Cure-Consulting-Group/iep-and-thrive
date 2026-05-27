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
}
