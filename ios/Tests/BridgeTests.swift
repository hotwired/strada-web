import XCTest
import WebKit
@testable import Strata

class BridgeTests: XCTestCase {
    func testInitAutomaticallyLoadsIntoWebView() {
        let webView = WKWebView()
        let userContentController = webView.configuration.userContentController
        XCTAssertTrue(userContentController.userScripts.isEmpty)
        
        _ = Bridge(webView: webView)
        XCTAssertEqual(userContentController.userScripts.count, 1)
    }
    
    func testLoadIntoConfiguration() {
        let webView = WKWebView()
        let userContentController = webView.configuration.userContentController
        XCTAssertTrue(userContentController.userScripts.isEmpty)
        
        let bridge = Bridge()
        bridge.webView = webView
        XCTAssertEqual(userContentController.userScripts.count, 1)
    }
    
    func testRegisterComponentCallsJavaScriptFunction() {
        let webView = TestWebView()
        let bridge = Bridge(webView: webView)
        XCTAssertNil(webView.lastEvaluatedJavaScript)
        
        bridge.register(component: "test")
        XCTAssertEqual(webView.lastEvaluatedJavaScript, "window.nativeBridge.register(\"test\")")
    }
    
    func testRegisterComponentsCallsJavaScriptFunction() {
        let webView = TestWebView()
        let bridge = Bridge(webView: webView)
        XCTAssertNil(webView.lastEvaluatedJavaScript)
        
        bridge.register(components: ["one", "two"])
        XCTAssertEqual(webView.lastEvaluatedJavaScript, "window.nativeBridge.register([\"one\",\"two\"])")
    }
    
    func testUnregisterComponentCallsJavaScriptFunction() {
        let webView = TestWebView()
        let bridge = Bridge(webView: webView)
        XCTAssertNil(webView.lastEvaluatedJavaScript)
        
        bridge.unregister(component: "test")
        XCTAssertEqual(webView.lastEvaluatedJavaScript, "window.nativeBridge.unregister(\"test\")")
    }
    
    func testSendCallsJavaScriptFunction() {
        let webView = TestWebView()
        let bridge = Bridge(webView: webView)
        XCTAssertNil(webView.lastEvaluatedJavaScript)
        
        let message = Message(id: "1", component: "test", event: "send", data: ["title": "testing"])
        bridge.send(message)
        XCTAssertEqual(webView.lastEvaluatedJavaScript, "window.nativeBridge.send({\"component\":\"test\",\"event\":\"send\",\"data\":{\"title\":\"testing\"},\"id\":\"1\"})")
    }
}

private final class TestWebView: WKWebView {
    var lastEvaluatedJavaScript: String?
    
    override func evaluateJavaScript(_ javaScriptString: String, completionHandler: ((Any?, Error?) -> Void)? = nil) {
        lastEvaluatedJavaScript = javaScriptString
        super.evaluateJavaScript(javaScriptString, completionHandler: completionHandler)
    }
}
