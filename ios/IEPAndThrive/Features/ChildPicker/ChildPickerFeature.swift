import ComposableArchitecture
import Foundation

/// Surfaced after the parent signs in when their `users/{uid}/students/`
/// collection has 2+ docs — they need to tell the iPad which child is
/// using it. With 0 or 1 students, RootFeature auto-resolves (uses the
/// existing student or keeps the iOS-default one) and never opens this.
@Reducer
struct ChildPickerFeature {
    struct State: Equatable {
        let uid: String
        var students: [StudentSummaryDTO] = []
        var isLoading: Bool = false
        var errorMessage: String? = nil
    }

    enum Action {
        case onAppear
        case studentsLoaded([StudentSummaryDTO])
        case loadFailed(String)
        case studentTapped(id: String)
        case addNewChildTapped
        case delegate(Delegate)

        @CasePathable
        enum Delegate: Equatable {
            /// Parent picked which existing student doc the iPad is for.
            /// RootFeature responds by setting selectedStudentId +
            /// re-running migration to the picked target.
            case studentSelected(id: String)
            /// Parent chose "Set up a new child" — RootFeature mints a
            /// fresh UUID and uses it as the target.
            case createNewStudent
        }
    }

    @Dependency(\.firestoreClient) var firestoreClient
    @Dependency(\.dismiss) var dismiss

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.isLoading = true
                state.errorMessage = nil
                return .run { [firestoreClient, uid = state.uid] send in
                    do {
                        let students = try await firestoreClient.fetchAllStudents(uid)
                        await send(.studentsLoaded(students))
                    } catch {
                        await send(.loadFailed(error.localizedDescription))
                    }
                }

            case let .studentsLoaded(students):
                state.isLoading = false
                state.students = students
                return .none

            case let .loadFailed(message):
                state.isLoading = false
                state.errorMessage = message
                return .none

            case let .studentTapped(id):
                return .concatenate(
                    .send(.delegate(.studentSelected(id: id))),
                    .run { _ in await dismiss() }
                )

            case .addNewChildTapped:
                return .concatenate(
                    .send(.delegate(.createNewStudent)),
                    .run { _ in await dismiss() }
                )

            case .delegate:
                return .none
            }
        }
    }
}
