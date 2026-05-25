import SwiftUI

/// Design System for IEP & Thrive (iOS Pivot)
/// Based on .stitch/DESIGN.md
struct Theme {
    struct Colors {
        static let forest = Color(hex: "1B4332")
        static let forestMid = Color(hex: "2D6A4F")
        static let forestLight = Color(hex: "40916C")
        static let sage = Color(hex: "B7E4C7")
        static let sagePale = Color(hex: "D8F3DC")
        static let cream = Color(hex: "FDFAF4")
        static let creamDeep = Color(hex: "F5EFE0")
        static let amber = Color(hex: "D4860B")
        static let amberLight = Color(hex: "FFF3CD")
        static let text = Color(hex: "1C1917")
        static let textMuted = Color(hex: "78716C")
        static let white = Color.white
    }
    
    struct Fonts {
        static func display(size: CGFloat, weight: Font.Weight = .bold) -> Font {
            // Falls back to system serif if Playfair Display is not loaded
            Font.custom("Playfair Display", size: size).weight(weight)
        }
        
        static func body(size: CGFloat, weight: Font.Weight = .regular) -> Font {
            // Falls back to system sans if DM Sans is not loaded
            Font.custom("DM Sans", size: size).weight(weight)
        }
    }
    
    struct Layout {
        static let cornerRadiusPill: CGFloat = 100
        static let cornerRadiusCard: CGFloat = 20
        static let cornerRadiusElement: CGFloat = 12
        
        static let shadowCard: (Color, CGFloat, CGFloat, CGFloat) = (
            Color(hex: "1B4332").opacity(0.10), 32, 0, 8
        )
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
