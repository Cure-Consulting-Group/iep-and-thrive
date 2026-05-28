import ComposableArchitecture
import SwiftUI

@Reducer
struct RootFeature {
    struct State: Equatable {
        var journey = JourneyFeature.State()
        var onboarding = OnboardingFeature.State()
        @PresentationState var paywall: PaywallFeature.State?
        @PresentationState var auth: AuthFeature.State?
        @PresentationState var childPicker: ChildPickerFeature.State?
        var path = StackState<Path.State>()

        var isUserOnboarded: Bool = false
        var isPremium: Bool = false
        /// Anonymous Firebase UID, populated once `authClient.signInAnonymously()`
        /// resolves on launch. Used downstream for Firestore sync addressing.
        var currentUid: String? = nil
        /// Anon UID captured at sign-in time so the picker resolution
        /// (which may happen seconds later) knows where to migrate FROM.
        var pendingMigrationFromUid: String? = nil
    }

    enum Action {
        case journey(JourneyFeature.Action)
        case onboarding(OnboardingFeature.Action)
        case paywall(PresentationAction<PaywallFeature.Action>)
        case auth(PresentationAction<AuthFeature.Action>)
        case childPicker(PresentationAction<ChildPickerFeature.Action>)
        case path(StackAction<Path.State, Path.Action>)
        case appDelegate(AppDelegateAction)
        case authResolved(String)
        case profileLoaded(StudentProfile?)
        case subscriptionStatusChanged(Bool)
        case studentsFetched(forUid: String, students: [StudentSummaryDTO])
    }

    enum AppDelegateAction {
        case didFinishLaunching
    }

    @Dependency(\.database) var database
    @Dependency(\.storeKit) var storeKit
    @Dependency(\.authClient) var authClient
    @Dependency(\.firestoreClient) var firestoreClient
    @Dependency(\.crashlyticsClient) var crashlyticsClient
    
    var body: some ReducerOf<Self> {
        Scope(state: \.journey, action: \.journey) {
            JourneyFeature()
        }
        
        Scope(state: \.onboarding, action: \.onboarding) {
            OnboardingFeature()
        }
        
        Reduce { state, action in
            switch action {
            case .appDelegate(.didFinishLaunching):
                return .run { [authClient, database, storeKit] send in
                    // Anonymous Firebase Auth runs first — both the local
                    // profile fetch and Firestore sync downstream need a
                    // UID. signInAnonymously is idempotent: it reuses the
                    // cached session on relaunch, so the UID is stable
                    // across app starts and survives reinstalls of the
                    // app on the same device.
                    if let uid = try? await authClient.signInAnonymously() {
                        await send(.authResolved(uid))
                    }
                    let profile = try? await database.fetchProfile()
                    await send(.profileLoaded(profile))

                    for await isPremium in await storeKit.observeStatus() {
                        await send(.subscriptionStatusChanged(isPremium))
                    }
                }

            case let .authResolved(uid):
                state.currentUid = uid
                return .run { [crashlyticsClient] _ in
                    crashlyticsClient.setUserId(uid)
                    crashlyticsClient.log("auth: resolved uid=\(uid)")
                }

            case let .profileLoaded(profile):
                state.isUserOnboarded = (profile != nil)
                if state.isUserOnboarded && !state.isPremium {
                    state.paywall = PaywallFeature.State()
                }
                return .none
                
            case let .subscriptionStatusChanged(isPremium):
                state.isPremium = isPremium
                if isPremium {
                    state.paywall = nil
                }
                return .none
                
            case .onboarding(.onboardingComplete):
                state.isUserOnboarded = true
                if !state.isPremium {
                    state.paywall = PaywallFeature.State()
                }
                return .none

            case .onboarding(.signInTapped):
                state.auth = AuthFeature.State()
                return .none

            case let .auth(.presented(.delegate(.signedIn(uid: newUid)))):
                // Phase 2.4: defer migration until the picker resolves
                // (or we've confirmed only 0/1 students exist and we
                // can auto-pick). Capture the anon UID now so the
                // resolution flow knows where to read FROM.
                state.pendingMigrationFromUid = state.currentUid
                state.currentUid = newUid
                return .run { [firestoreClient, crashlyticsClient] send in
                    crashlyticsClient.setUserId(newUid)
                    crashlyticsClient.log("auth: signed in uid=\(newUid)")
                    do {
                        let students = try await firestoreClient.fetchAllStudents(newUid)
                        await send(.studentsFetched(forUid: newUid, students: students))
                    } catch {
                        // If the read fails (rules, network), fall back
                        // to a default-target migration so we don't
                        // strand the anon data. Record the failure so
                        // it surfaces in Crashlytics even though we
                        // recover gracefully.
                        crashlyticsClient.recordError(error, "firestore.fetchAllStudents")
                        await send(.studentsFetched(forUid: newUid, students: []))
                    }
                }

            case let .studentsFetched(forUid, students):
                let anonUid = state.pendingMigrationFromUid
                switch students.count {
                case 0:
                    // No existing students under this account — keep
                    // the iOS-default ID and migrate anon → authed/default.
                    let target = FirestoreSchema.defaultStudentId
                    state.journey.studentId = target
                    state.pendingMigrationFromUid = nil
                    return .run { [firestoreClient, crashlyticsClient] _ in
                        crashlyticsClient.log("migration: resolved 0 students, target=\(target)")
                        if let anonUid, anonUid != forUid {
                            await Self.migrateOrRecord(firestoreClient, crashlyticsClient,
                                                        anonUid, forUid, target)
                        }
                    }
                case 1:
                    // Exactly one existing student — auto-select.
                    let target = students[0].id
                    state.journey.studentId = target
                    state.pendingMigrationFromUid = nil
                    return .run { [firestoreClient, crashlyticsClient] _ in
                        crashlyticsClient.log("migration: resolved 1 student, target=\(target)")
                        if let anonUid, anonUid != forUid {
                            await Self.migrateOrRecord(firestoreClient, crashlyticsClient,
                                                        anonUid, forUid, target)
                        }
                    }
                default:
                    // 2+ students — ask the parent which child this iPad is for.
                    state.childPicker = ChildPickerFeature.State(
                        uid: forUid,
                        students: students
                    )
                    return .run { [crashlyticsClient] _ in
                        crashlyticsClient.log("migration: presenting picker for \(students.count) students")
                    }
                }

            case let .childPicker(.presented(.delegate(.studentSelected(id: pickedId)))):
                let anonUid = state.pendingMigrationFromUid
                let authedUid = state.currentUid
                state.journey.studentId = pickedId
                state.pendingMigrationFromUid = nil
                return .run { [firestoreClient, crashlyticsClient] _ in
                    crashlyticsClient.log("picker: studentSelected target=\(pickedId)")
                    if let anonUid, let authedUid, anonUid != authedUid {
                        await Self.migrateOrRecord(firestoreClient, crashlyticsClient,
                                                    anonUid, authedUid, pickedId)
                    }
                }

            case .childPicker(.presented(.delegate(.createNewStudent))):
                // Mint a fresh UUID for the new student. The iOS-side
                // profile (if any) stays the same — Firestore just gets
                // a new doc id at users/{authed}/students/{newId}.
                let anonUid = state.pendingMigrationFromUid
                let authedUid = state.currentUid
                let newStudentId = UUID().uuidString
                state.journey.studentId = newStudentId
                state.pendingMigrationFromUid = nil
                return .run { [firestoreClient, crashlyticsClient] _ in
                    crashlyticsClient.log("picker: createNewStudent target=\(newStudentId)")
                    if let anonUid, let authedUid, anonUid != authedUid {
                        await Self.migrateOrRecord(firestoreClient, crashlyticsClient,
                                                    anonUid, authedUid, newStudentId)
                    }
                }
                
            case let .journey(.levelPreview(.presented(.startButtonTapped(level)))):
                state.journey.levelPreview = nil
                switch level.category {
                case .literacy:
                    state.path.append(Path.State.literacy(LiteracyFeature.State(level: level)))
                case .math:
                    state.path.append(Path.State.math(MathFeature.State(level: level)))
                }
                return .none

            case .journey(.safeSpaceTapped):
                state.path.append(Path.State.safeSpace(SafeSpaceFeature.State()))
                return .none

            case let .path(.element(id: _, action: .literacy(.doneTapped))):
                if case let .literacy(literacyState) = state.path.last {
                    state.path.removeLast()
                    return .send(.journey(.missionComplete(literacyState.level)))
                }
                return .none

            case .path(.element(id: _, action: .literacy(.backTapped))):
                state.path.removeLast()
                return .none

            case let .path(.element(id: _, action: .math(.checkAnswerTapped))):
                // Only pop + award when the tray actually matches the
                // level's target count. Incorrect attempts surface a
                // hint in the Math reducer and stay on the screen.
                guard case let .math(mathState) = state.path.last, mathState.isCorrect else {
                    return .none
                }
                state.path.removeLast()
                return .send(.journey(.missionComplete(mathState.level)))

            case .path(.element(id: _, action: .math(.backTapped))):
                state.path.removeLast()
                return .none

            case .path(.element(id: _, action: .safeSpace(.exitTapped))):
                state.path.removeLast()
                return .none

            case .journey, .onboarding, .path, .paywall, .auth, .childPicker:
                return .none
            }
        }
        .ifLet(\.$paywall, action: \.paywall) {
            PaywallFeature()
        }
        .ifLet(\.$auth, action: \.auth) {
            AuthFeature()
        }
        .ifLet(\.$childPicker, action: \.childPicker) {
            ChildPickerFeature()
        }
        .forEach(\.path, action: \.path) {
            Path()
        }
    }
    
    /// Migration runner that records any error to Crashlytics instead
    /// of swallowing it via `try?`. Used by every post-auth resolution
    /// branch (0 / 1 / 2+ students) since they share the same effect
    /// shape — call this from inside a `.run { }` effect.
    private static func migrateOrRecord(
        _ firestoreClient: FirestoreClient,
        _ crashlyticsClient: CrashlyticsClient,
        _ anonUid: String,
        _ authedUid: String,
        _ targetStudentId: String
    ) async {
        do {
            try await firestoreClient.migrateAnonData(anonUid, authedUid, targetStudentId)
            crashlyticsClient.log("migration: complete → \(targetStudentId)")
        } catch {
            crashlyticsClient.recordError(error, "firestore.migrateAnonData")
        }
    }

    @Reducer
    struct Path {
        enum State: Equatable {
            case literacy(LiteracyFeature.State)
            case math(MathFeature.State)
            case safeSpace(SafeSpaceFeature.State)
        }
        
        enum Action {
            case literacy(LiteracyFeature.Action)
            case math(MathFeature.Action)
            case safeSpace(SafeSpaceFeature.Action)
        }
        
        var body: some ReducerOf<Self> {
            Scope(state: /State.literacy, action: /Action.literacy) {
                LiteracyFeature()
            }
            Scope(state: /State.math, action: /Action.math) {
                MathFeature()
            }
            Scope(state: /State.safeSpace, action: /Action.safeSpace) {
                SafeSpaceFeature()
            }
        }
    }
}
