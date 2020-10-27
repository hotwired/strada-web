//
//  Bridge.swift
//  Strata
//
//  Created by Zach Waugh on 3/1/19.
//  Copyright © 2019 Basecamp. All rights reserved.
//

import Foundation
import WebKit

public protocol BridgeDelegate: class {
    func bridgeDidInitialize()
    func bridgeDidReceiveMessage(_ message: Message)
}

public enum BridgeError: Error {
    case javaScriptGenerationError
}

// This needs to match whatever is set in strata.js
private let bridgeGlobal = "window.nativeBridge"

// webkit.messageHandlers.strata
private let bridgeHandlerName = "strata"

public final class Bridge {
    public typealias CompletionHandler = (_ result: Any?, _ error: Error?) -> Void
    
    public weak var delegate: BridgeDelegate?
    public var webView: WKWebView?
    
    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: bridgeHandlerName)
    }
    
    public init(webView: WKWebView? = nil) {
        self.webView = webView
    }

    // MARK: - API

    public func register(component: String) {
        guard let javaScript = generateJavaScript(bridgeFunction: "register", argument: component) else { return }
        evaluate(javaScript: javaScript)
    }

    public func register(components: [String]) {
        guard let javaScript = generateJavaScript(bridgeFunction: "register", argument: components) else { return }
        evaluate(javaScript: javaScript)
    }

    public func unregister(component: String) {
        guard let javaScript = generateJavaScript(bridgeFunction: "unregister", argument: component) else { return }
        evaluate(javaScript: javaScript)
    }

    public func send(_ message: Message) {
        guard let javaScript = generateJavaScript(bridgeFunction: "send", argument: message.toJSON()) else { return }
        evaluate(javaScript: javaScript)
    }

    // MARK: - Configuration

    public func load(into configuration: WKWebViewConfiguration) {
        guard let userScript = userScript() else { return }

        // Install user script and message handlers in web view
        configuration.userContentController.addUserScript(userScript)
        configuration.userContentController.add(ScriptMessageHandler(delegate: self), name: bridgeHandlerName)
    }

    private func userScript() -> WKUserScript? {
        guard let url = Bundle(for: Bridge.self).url(forResource: "strata", withExtension: "js"),
            let source = try? String(contentsOf: url, encoding: .utf8) else {
                return nil
        }

        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    // MARK: - JavaScript

    public func evaluate(javaScript: String, completion: CompletionHandler? = nil) {
        debugLog("[Strata] evaluating: \(javaScript)")
        
        webView?.evaluateJavaScript(javaScript) { result, error in
            if let error = error {
                debugLog("[Strata] *** error evaluating JavaScript: \(error)")
            }
            
            completion?(result, error)
        }
    }
    
    public func evaluate(function: String, arguments: [Any] = [], completion: CompletionHandler? = nil) {
        guard let javaScript = generateJavaScript(function: function, arguments: arguments) else {
            completion?(nil, BridgeError.javaScriptGenerationError)
            return
        }
        
        evaluate(javaScript: javaScript, completion: completion)
    }

    private func generateJavaScript(bridgeFunction function: String, argument: Any) -> String? {
        generateJavaScript(bridgeFunction: function, arguments: [argument])
    }

    private func generateJavaScript(bridgeFunction function: String, arguments: [Any] = []) -> String? {
        generateJavaScript(function: "\(bridgeGlobal).\(function)", arguments: arguments)
    }

    public func generateJavaScript(function: String, arguments: [Any] = []) -> String? {
        guard let encodedArguments = encode(arguments: arguments) else {
            debugLog("[Strata] *** error encoding arguments: \(arguments)")
            return nil
        }

        let functionName = sanitizeFunctionName(function)
        return "\(functionName)(\(encodedArguments))"
    }

    private func encode(arguments: [Any]) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: arguments, options: []),
            let string = String(data: data, encoding: .utf8) else {
                return nil
        }

        return String(string.dropFirst().dropLast())
    }

    private func sanitizeFunctionName(_ name: String) -> String {
        // Strip parens if included
        name.hasSuffix("()") ? String(name.dropLast(2)) : name
    }
}

extension Bridge: ScriptMessageHandlerDelegate {
    func scriptMessageHandlerDidReceiveMessage(_ scriptMessage: WKScriptMessage) {
        if let event = scriptMessage.body as? String, event == "ready" {
            delegate?.bridgeDidInitialize()
        } else if let message = Message(scriptMessage: scriptMessage) {
            delegate?.bridgeDidReceiveMessage(message)
        } else {
            debugLog("[Strata] unhandled message received: \(scriptMessage.body)")
        }
    }
}

// Avoids retain cycle caused by WKUserContentController
protocol ScriptMessageHandlerDelegate: class {
    func scriptMessageHandlerDidReceiveMessage(_ scriptMessage: WKScriptMessage)
}

private class ScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: ScriptMessageHandlerDelegate?
    
    init(delegate: ScriptMessageHandlerDelegate?) {
        self.delegate = delegate
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive scriptMessage: WKScriptMessage) {
        delegate?.scriptMessageHandlerDidReceiveMessage(scriptMessage)
    }
}

func debugLog(_ message: String) {
    #if DEBUG
    print(message)
    #endif
}
