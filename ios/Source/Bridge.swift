import Foundation
import WebKit

public protocol BridgeDelegate: class {
    func bridgeDidInitialize()
    func bridgeDidReceiveMessage(_ message: Message)
}

public enum BridgeError: Error {
    case missingWebView
}


/// `Bridge` is the object for configuring a web view and
/// the channel for sending/receiving messages
public final class Bridge {
    public typealias CompletionHandler = (_ result: Any?, _ error: Error?) -> Void
    
    public var webView: WKWebView?
    public weak var delegate: BridgeDelegate?

    /// This needs to match whatever the JavaScript file uses
    private let bridgeGlobal = "window.nativeBridge"
    
    /// The window.webkit.messageHandlers name
    private let scriptHandlerName = "strata"
    
    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: scriptHandlerName)
    }
    
    /// Create a new Bridge object for calling methods on this web view with a delegate
    /// for receiving messages
    public init(webView: WKWebView? = nil, delegate: BridgeDelegate? = nil) {
        self.webView = webView
        self.delegate = delegate
    }

    // MARK: - API
    
    /// Register a single component
    /// - Parameter component: Name of a component to register support for
    public func register(component: String) {
        callBridgeFunction("register", arguments: [component])
    }
    
    /// Register multiple components
    /// - Parameter components: Array of component names to register
    public func register(components: [String]) {
        callBridgeFunction("register", arguments: components)
    }
    
    /// Unregister support for a single component
    /// - Parameter component: Component name
    public func unregister(component: String) {
        callBridgeFunction("unregister", arguments: [component])
    }
    
    /// Send a message through the bridge to the web application
    /// - Parameter message: Message to send
    public func send(_ message: Message) {
        callBridgeFunction("send", arguments: [message.toJSON()])
    }
    
    private func callBridgeFunction(_ function: String, arguments: [Any]) {
        let js = JavaScript(functionName: function, arguments: arguments)
        evaluate(javaScript: js)
    }

    // MARK: - Configuration

    
    /// Configure the bridge in the provided configuration
    /// - Parameter configuration: WKWebViewConfiguration used to setup a web view
    public func load(into configuration: WKWebViewConfiguration) {
        guard let userScript = userScript() else { return }

        // Install user script and message handlers in web view
        configuration.userContentController.addUserScript(userScript)
        configuration.userContentController.add(ScriptMessageHandler(delegate: self), name: scriptHandlerName)
    }

    private func userScript() -> WKUserScript? {
        guard let url = Bundle(for: Self.self).url(forResource: "strata", withExtension: "js"),
            let source = try? String(contentsOf: url, encoding: .utf8) else {
                return nil
        }

        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    // MARK: - JavaScript Evaluation

    public func evaluate(javaScript: String, completion: CompletionHandler? = nil) {
        guard let webView = webView else {
            completion?(nil, BridgeError.missingWebView)
            return
        }
        
        webView.evaluateJavaScript(javaScript) { result, error in
            if let error = error {
                debugLog("[Strata] *** Error evaluating JavaScript: \(error)")
            }
            
            completion?(result, error)
        }
    }
    
    public func evaluate(function: String, arguments: [Any] = [], completion: CompletionHandler? = nil) {
        evaluate(javaScript: JavaScript(functionName: function, arguments: arguments))
    }
    
    private func evaluate(javaScript: JavaScript, completion: CompletionHandler? = nil) {
        do {
            evaluate(javaScript: try javaScript.toString(), completion: completion)
        } catch {
            debugLog("Error evaluating JavaScript: \(javaScript), error: \(error)")
            completion?(nil, error)
        }
    }
}

extension Bridge: ScriptMessageHandlerDelegate {
    func scriptMessageHandlerDidReceiveMessage(_ scriptMessage: WKScriptMessage) {
        if let event = scriptMessage.body as? String, event == "ready" {
            delegate?.bridgeDidInitialize()
        } else if let message = Message(scriptMessage: scriptMessage) {
            delegate?.bridgeDidReceiveMessage(message)
        } else {
            debugLog("Unhandled message received: \(scriptMessage.body)")
        }
    }
}
