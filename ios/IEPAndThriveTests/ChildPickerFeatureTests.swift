import ComposableArchitecture
import XCTest
@testable import IEPAndThrive

@MainActor
final class ChildPickerFeatureTests: XCTestCase {

    private let students = [
        StudentSummaryDTO(id: "kid-A", firstName: "Aiden", age: 8, createdAt: nil),
        StudentSummaryDTO(id: "kid-B", firstName: "Maya", age: 6, createdAt: nil)
    ]

    func test_onAppear_loadsStudentsFromFirestore() async {
        let fetchedUid = Box<String?>(nil)
        let store = TestStore(
            initialState: ChildPickerFeature.State(uid: "parent-uid")
        ) {
            ChildPickerFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { [students] uid in
                fetchedUid.setValue(uid)
                return students
            }
        }

        await store.send(.onAppear) { $0.isLoading = true }
        await store.receive(\.studentsLoaded) {
            $0.isLoading = false
            $0.students = self.students
        }

        XCTAssertEqual(fetchedUid.value, "parent-uid",
            "Picker must fetch students under the authenticated parent UID.")
    }

    func test_onAppear_failure_surfacesError() async {
        struct LoadError: Error, LocalizedError {
            var errorDescription: String? { "Network blip. Try again." }
        }

        let store = TestStore(
            initialState: ChildPickerFeature.State(uid: "parent-uid")
        ) {
            ChildPickerFeature()
        } withDependencies: {
            $0.firestoreClient.fetchAllStudents = { _ in throw LoadError() }
        }

        await store.send(.onAppear) { $0.isLoading = true }
        await store.receive(\.loadFailed) {
            $0.isLoading = false
            $0.errorMessage = "Network blip. Try again."
        }
    }

    func test_studentTapped_emitsDelegateAndDismisses() async {
        let store = TestStore(
            initialState: ChildPickerFeature.State(uid: "parent-uid", students: students)
        ) {
            ChildPickerFeature()
        }
        // The reducer fires .delegate + dismisses — we just want to
        // assert the delegate fires with the picked ID.
        store.exhaustivity = .off

        await store.send(.studentTapped(id: "kid-A"))
        await store.receive(\.delegate.studentSelected)
    }

    func test_addNewChildTapped_emitsCreateNewDelegate() async {
        let store = TestStore(
            initialState: ChildPickerFeature.State(uid: "parent-uid")
        ) {
            ChildPickerFeature()
        }
        store.exhaustivity = .off

        await store.send(.addNewChildTapped)
        await store.receive(\.delegate.createNewStudent)
    }
}
