import Foundation
import ComposableArchitecture

struct LevelDefinition: Equatable, Identifiable {
    let id: String
    let title: String
    let category: Category
    let targetValue: String
    let biome: Biome

    enum Category: String, Codable {
        case literacy
        case math
    }

    enum Biome: String, Codable {
        case forest
        case desert
        case mountain
    }

    /// Parent-facing description of what the child will practice, shown on the
    /// level preview sheet. Falls back to a sensible default when no explicit
    /// mapping exists for the `targetValue`.
    var missionDescription: String {
        switch category {
        case .literacy:
            return literacyDescription
        case .math:
            return mathDescription
        }
    }

    private var literacyDescription: String {
        switch targetValue {
        case "a", "e", "i", "o", "u":
            return "Help your Explorer master the short '\(targetValue)' sound."
        case "sh", "ch", "th", "wh", "ck":
            return "Practice the '\(targetValue)' digraph — two letters, one sound."
        case "ai", "ay", "ee", "ea", "oa", "ow":
            return "Meet the '\(targetValue)' vowel team and the sound they share."
        case "bl, st, fl":
            return "Blend beginning consonants together: bl, st, fl."
        case "nd, st, nt":
            return "Catch ending blends like nd, st, and nt."
        case "predict":   return "Learn to predict what happens next in a story."
        case "monitor":   return "Practice checking your own understanding as you read."
        case "retell":    return "Retell a story with a beginning, middle, and end."
        case "main-idea": return "Find the main idea — what the text is mostly about."
        case "details":   return "Spot the details that support the main idea."
        case "topic":     return "Write a strong topic sentence."
        case "sentence-details": return "Add detail sentences that bring writing to life."
        default:
            return title
        }
    }

    private var mathDescription: String {
        switch targetValue {
        case "1000":   return "Build place value all the way to 1,000."
        case "10000":  return "Stretch place value to 10,000."
        case "round-10":  return "Round numbers to the nearest 10."
        case "round-100": return "Round numbers to the nearest 100."
        case "estimate":  return "Estimate before you compute."
        case "add":  return "Build addition fluency with quick wins."
        case "sub":  return "Build subtraction fluency with quick wins."
        case "equal-groups": return "Make equal groups to set up multiplication."
        case "arrays": return "Use arrays — rows and columns — to multiply."
        case "x0-x1":  return "Master the 0× and 1× facts."
        case "x2":     return "Master the 2× facts."
        case "x5":     return "Master the 5× facts."
        case "x10":    return "Master the 10× facts."
        default:
            return title
        }
    }
}

struct CurriculumClient {
    var levels: @Sendable () -> [LevelDefinition]
}

extension CurriculumClient: DependencyKey {
    static let liveValue = Self(
        levels: {
            [
                // Week 1 Literacy
                LevelDefinition(id: "lit-1", title: "Short Vowel 'a'", category: .literacy, targetValue: "a", biome: .forest),
                LevelDefinition(id: "lit-2", title: "Short Vowel 'e'", category: .literacy, targetValue: "e", biome: .forest),
                LevelDefinition(id: "lit-3", title: "Short Vowel 'i'", category: .literacy, targetValue: "i", biome: .forest),
                LevelDefinition(id: "lit-4", title: "Short Vowel 'o'", category: .literacy, targetValue: "o", biome: .forest),
                LevelDefinition(id: "lit-5", title: "Short Vowel 'u'", category: .literacy, targetValue: "u", biome: .forest),
                LevelDefinition(id: "lit-6", title: "Beginning Blends", category: .literacy, targetValue: "bl, st, fl", biome: .forest),
                LevelDefinition(id: "lit-7", title: "Ending Blends", category: .literacy, targetValue: "nd, st, nt", biome: .forest),
                LevelDefinition(id: "lit-8", title: "Digraph 'sh'", category: .literacy, targetValue: "sh", biome: .forest),
                LevelDefinition(id: "lit-9", title: "Digraph 'ch'", category: .literacy, targetValue: "ch", biome: .forest),
                LevelDefinition(id: "lit-10", title: "Digraph 'th'", category: .literacy, targetValue: "th", biome: .forest),
                LevelDefinition(id: "lit-11", title: "Digraph 'wh'", category: .literacy, targetValue: "wh", biome: .forest),
                LevelDefinition(id: "lit-12", title: "Digraph 'ck'", category: .literacy, targetValue: "ck", biome: .forest),
                LevelDefinition(id: "lit-13", title: "Making Predictions", category: .literacy, targetValue: "predict", biome: .forest),
                LevelDefinition(id: "lit-14", title: "Monitoring Comprehension", category: .literacy, targetValue: "monitor", biome: .forest),
                LevelDefinition(id: "lit-15", title: "Retelling (B/M/E)", category: .literacy, targetValue: "retell", biome: .forest),
                
                // Week 2 Literacy
                LevelDefinition(id: "lit-16", title: "Vowel Team 'ai'", category: .literacy, targetValue: "ai", biome: .desert),
                LevelDefinition(id: "lit-17", title: "Vowel Team 'ay'", category: .literacy, targetValue: "ay", biome: .desert),
                LevelDefinition(id: "lit-18", title: "Vowel Team 'ee'", category: .literacy, targetValue: "ee", biome: .desert),
                LevelDefinition(id: "lit-19", title: "Vowel Team 'ea'", category: .literacy, targetValue: "ea", biome: .desert),
                LevelDefinition(id: "lit-20", title: "Vowel Team 'oa'", category: .literacy, targetValue: "oa", biome: .desert),
                LevelDefinition(id: "lit-21", title: "Vowel Team 'ow'", category: .literacy, targetValue: "ow", biome: .desert),
                LevelDefinition(id: "lit-22", title: "Main Idea Web", category: .literacy, targetValue: "main-idea", biome: .desert),
                LevelDefinition(id: "lit-23", title: "Supporting Details", category: .literacy, targetValue: "details", biome: .desert),
                LevelDefinition(id: "lit-24", title: "Topic Sentences", category: .literacy, targetValue: "topic", biome: .desert),
                LevelDefinition(id: "lit-25", title: "Detail Sentences", category: .literacy, targetValue: "sentence-details", biome: .desert),
                
                // Week 1 Math
                LevelDefinition(id: "math-1", title: "Place Value to 1,000", category: .math, targetValue: "1000", biome: .mountain),
                LevelDefinition(id: "math-2", title: "Place Value to 10,000", category: .math, targetValue: "10000", biome: .mountain),
                LevelDefinition(id: "math-3", title: "Rounding to 10", category: .math, targetValue: "round-10", biome: .mountain),
                LevelDefinition(id: "math-4", title: "Rounding to 100", category: .math, targetValue: "round-100", biome: .mountain),
                LevelDefinition(id: "math-5", title: "Estimation", category: .math, targetValue: "estimate", biome: .mountain),
                LevelDefinition(id: "math-6", title: "Addition Fluency", category: .math, targetValue: "add", biome: .mountain),
                LevelDefinition(id: "math-7", title: "Subtraction Fluency", category: .math, targetValue: "sub", biome: .mountain),
                
                // Week 2 Math
                LevelDefinition(id: "math-8", title: "Equal Groups", category: .math, targetValue: "equal-groups", biome: .forest),
                LevelDefinition(id: "math-9", title: "Arrays", category: .math, targetValue: "arrays", biome: .desert),
                LevelDefinition(id: "math-10", title: "Multiplication x0 & x1", category: .math, targetValue: "x0-x1", biome: .mountain),
                LevelDefinition(id: "math-11", title: "Multiplication x2", category: .math, targetValue: "x2", biome: .forest),
                LevelDefinition(id: "math-12", title: "Multiplication x5", category: .math, targetValue: "x5", biome: .desert),
                LevelDefinition(id: "math-13", title: "Multiplication x10", category: .math, targetValue: "x10", biome: .mountain)
            ]
        }
    )
    
    static let testValue = Self(
        levels: { [] }
    )
}

extension DependencyValues {
    var curriculumClient: CurriculumClient {
        get { self[CurriculumClient.self] }
        set { self[CurriculumClient.self] = newValue }
    }
}
