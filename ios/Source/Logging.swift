import Foundation

func debugLog(_ message: String) {
    #if DEBUG
    print(message)
    #endif
}
