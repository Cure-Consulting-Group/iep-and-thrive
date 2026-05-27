import Foundation

/// Tiny lock-protected box used by tests to capture values written from
/// `@Sendable` dependency closures. We avoid TCA's `LockIsolated` because
/// pulling in `ConcurrencyExtras` as a direct test-target product trips
/// the same transitive-link issue `Dependencies`/`CasePaths` do under
/// `xcodebuild build-for-testing`.
final class Box<T>: @unchecked Sendable {
    private let lock = NSLock()
    private var stored: T

    init(_ value: T) { self.stored = value }

    var value: T {
        get { lock.lock(); defer { lock.unlock() }; return stored }
        set { lock.lock(); defer { lock.unlock() }; stored = newValue }
    }

    func setValue(_ new: T) {
        lock.lock(); defer { lock.unlock() }
        stored = new
    }

    func withValue<R>(_ body: (inout T) -> R) -> R {
        lock.lock(); defer { lock.unlock() }
        return body(&stored)
    }
}
