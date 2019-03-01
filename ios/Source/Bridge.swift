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
    func bridgeDidReceiveMessage(_ message: Message)
}

// This needs to match whatever is set in strata.js
private let bridgeGlobal = "window.NativeBridge"

// webkit.messageHandlers.strata
private let bridgeHandlerName = "strata"

public class Bridge: NSObject {
    public weak var delegate: BridgeDelegate?
    public var webView: WKWebView?
    
    public init(webView: WKWebView? = nil) {
        self.webView = webView
        super.init()
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
        configuration.userContentController.add(self, name: bridgeHandlerName)
    }
    
    private func userScript() -> WKUserScript? {
        guard let url = Bundle(for: Bridge.self).url(forResource: "strata", withExtension: "js"),
            let source = try? String(contentsOf: url, encoding: .utf8) else {
                return nil
        }
        
        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }
    
    // MARK: - JavaScript
    
    private func evaluate(javaScript: String) {
        print("[bridge] evaluating: \(javaScript)")
        webView?.evaluateJavaScript(javaScript) { result, error in
            if let error = error {
                print("[bridge] *** error evaluating JavaScript: \(error)")
            }
        }
    }
    
    private func generateJavaScript(bridgeFunction function: String, argument: Any) -> String? {
        return generateJavaScript(bridgeFunction: function, arguments: [argument])
    }
    
    private func generateJavaScript(bridgeFunction function: String, arguments: [Any] = []) -> String? {
        return generateJavaScript(function: "\(bridgeGlobal).\(function)", arguments: arguments)
    }
    
    private func generateJavaScript(function: String, arguments: [Any] = []) -> String? {
        guard let encodedArguments = encode(arguments: arguments) else {
            print("[bridge] *** error encoding arguments: \(arguments)")
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
        return name.hasSuffix("()") ? String(name.dropLast(2)) : name
    }
}

extension Bridge: WKScriptMessageHandler {
    public func userContentController(_ userContentController: WKUserContentController, didReceive scriptMessage: WKScriptMessage) {
        guard let message = Message(scriptMessage: scriptMessage) else { return }
        delegate?.bridgeDidReceiveMessage(message)
    }
}
