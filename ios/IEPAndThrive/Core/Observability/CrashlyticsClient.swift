import ComposableArchitecture
import FirebaseCrashlytics
import Foundation

/// Thin wrapper around Firebase Crashlytics so reducers can record
/// errors and breadcrumb logs through TCA's dependency injection (and
/// stub it out in tests). Crashlytics itself is initialized implicitly
/// by `FirebaseApp.configure()` — no manual bootstrap needed.
///
/// Phase 3.3 — keeping the API small on purpose. We can grow this into
/// a fuller observability surface later (custom keys, breadcrumbs with
/// metadata dicts, A/B test bucket reporting) when there's a real
/// signal to attach to it.
struct CrashlyticsClient {
    /// Breadcrumb line that shows up in the timeline of a future crash
    /// report. Useful for tracing "what was the user doing right before
    /// this crashed?" without firing off a full non-fatal.
    var log: @Sendable (_ message: String) -> Void

    /// Records a non-fatal error. Surfaces in Firebase Console as a
    /// separate issue thread from crashes — used for the `try?`
    /// swallowed Firestore / Auth / SwiftData failures that won't
    /// crash the app but we still want eyes on.
    var recordError: @Sendable (_ error: Error, _ domain: String) -> Void

    /// Associates the current Firebase Auth UID with the session so
    /// crashes can be deduped per user. Called from RootFeature once
    /// `authClient.signInAnonymously()` (or sign-in) resolves.
    var setUserId: @Sendable (_ uid: String) -> Void
}

extension CrashlyticsClient: DependencyKey {
    static let liveValue = Self(
        log: { message in
            Crashlytics.crashlytics().log(message)
        },
        recordError: { error, domain in
            // Wrap with a domain so unrelated issue threads stay
            // separate in the Crashlytics console — otherwise a stray
            // Foundation NSError gets dumped into the same bucket.
            let nsError = error as NSError
            let wrapped = NSError(
                domain: domain,
                code: nsError.code,
                userInfo: nsError.userInfo.merging([
                    NSLocalizedDescriptionKey: error.localizedDescription
                ]) { lhs, _ in lhs }
            )
            Crashlytics.crashlytics().record(error: wrapped)
        },
        setUserId: { uid in
            Crashlytics.crashlytics().setUserID(uid)
        }
    )

    static let testValue = Self(
        log: { _ in },
        recordError: { _, _ in },
        setUserId: { _ in }
    )
}

extension DependencyValues {
    var crashlyticsClient: CrashlyticsClient {
        get { self[CrashlyticsClient.self] }
        set { self[CrashlyticsClient.self] = newValue }
    }
}
