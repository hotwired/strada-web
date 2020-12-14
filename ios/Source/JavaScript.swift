import Foundation

enum JavaScriptError: Error, Equatable {
    case invalidArgumentType
}

struct JavaScript {
    var object: String? = nil
    let functionName: String
    var arguments: [Any] = []

    func toString() throws -> String {
        let encodedArguments = try encode(arguments: arguments)
        let function = sanitizedFunctionName(functionName)
        return "\(function)(\(encodedArguments))"
    }
    
    private func encode(arguments: [Any]) throws -> String {
        guard JSONSerialization.isValidJSONObject(arguments) else {
            throw JavaScriptError.invalidArgumentType
        }
        
        let data = try JSONSerialization.data(withJSONObject: arguments, options: [])
        let string = String(data: data, encoding: .utf8)!
        return String(string.dropFirst().dropLast())
    }

    private func sanitizedFunctionName(_ name: String) -> String {
        // Strip parens if included
        let name = name.hasSuffix("()") ? String(name.dropLast(2)) : name
        
        if let object = object {
            return "\(object).\(name)"
        } else {
            return name
        }
    }
}
