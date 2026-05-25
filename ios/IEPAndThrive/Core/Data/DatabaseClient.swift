import Foundation
import SwiftData
import ComposableArchitecture

struct DatabaseClient {
    var fetchProfile: @Sendable () async throws -> StudentProfile?
    var saveProfile: @Sendable (StudentProfile) async throws -> Void
    var fetchProgress: @Sendable (String) async throws -> [LessonProgress]
    var saveProgress: @Sendable (LessonProgress) async throws -> Void
    var fetchSparksTotal: @Sendable () async throws -> Int
    var addSparks: @Sendable (Int, String) async throws -> Void
}

extension DatabaseClient: DependencyKey {
    static let liveValue = Self(
        fetchProfile: {
            let context = try await context()
            let descriptor = FetchDescriptor<StudentProfile>()
            return try context.fetch(descriptor).first
        },
        saveProfile: { profile in
            let context = try await context()
            context.insert(profile)
            try context.save()
        },
        fetchProgress: { category in
            let context = try await context()
            let descriptor = FetchDescriptor<LessonProgress>(
                predicate: #Predicate { \$0.category == category },
                sortBy: [SortDescriptor(\.levelIndex)]
            )
            return try context.fetch(descriptor)
        },
        saveProgress: { progress in
            let context = try await context()
            context.insert(progress)
            try context.save()
        },
        fetchSparksTotal: {
            let context = try await context()
            let descriptor = FetchDescriptor<SparksRecord>()
            let records = try context.fetch(descriptor)
            return records.reduce(0) { \$0 + \$1.amount }
        },
        addSparks: { amount, reason in
            let context = try await context()
            context.insert(SparksRecord(amount: amount, reason: reason))
            try context.save()
        }
    )
    
    // Internal helper to get/create context on a background actor
    private static func context() async throws -> ModelContext {
        // This is a simplified pattern for the boilerplate.
        // In a full implementation, we'd manage the ModelContainer as a singleton.
        return try await DatabaseContainer.shared.context()
    }
}

extension DependencyValues {
    var database: DatabaseClient {
        get { self[DatabaseClient.self] }
        set { self[DatabaseClient.self] = newValue }
    }
}

// Singleton-ish wrapper for the container to be used by the live dependency
final class DatabaseContainer {
    static let shared = DatabaseContainer()
    private var container: ModelContainer?
    
    @MainActor
    func context() throws -> ModelContext {
        if let container { return container.mainContext }
        let schema = Schema([
            StudentProfile.self,
            LessonProgress.self,
            SparksRecord.self
        ])
        let config = ModelConfiguration(isStoredInMemoryOnly: false)
        let newContainer = try ModelContainer(for: schema, configurations: [config])
        self.container = newContainer
        return newContainer.mainContext
    }
}
