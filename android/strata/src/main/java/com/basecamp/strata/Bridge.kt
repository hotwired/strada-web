package com.basecamp.strata

import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.gson.GsonBuilder

interface BridgeDelegate {
    fun bridgeDidInitialize()
    fun bridgeDidReceiveMessage(message: Message)
}

// These need to match whatever is set in strata.js
private const val bridgeGlobal = "window.nativeBridge"
private const val bridgeJavascriptInterface = "Strata"

@Suppress("unused")
class Bridge(val webView: WebView) {
    internal var repository = Repository()

    var delegate: BridgeDelegate? = null
    var componentsAreRegistered: Boolean = false
        private set

    init {
        // The JavascriptInterface must be added before the page is loaded
        webView.addJavascriptInterface(this, bridgeJavascriptInterface)
    }

    fun register(component: String) {
        val javascript = generateJavaScript("register", component)
        evaluate(javascript)
    }

    fun register(components: List<String>) {
        val javascript = generateJavaScript("register", components)
        evaluate(javascript)
    }

    fun unregister(component: String) {
        val javascript = generateJavaScript("unregister", component)
        evaluate(javascript)
    }

    fun send(message: Message) {
        val javascript = generateJavaScript("send", message.toJSON())
        evaluate(javascript)
    }

    fun load() {
        evaluate(userScript())
    }

    fun reset() {
        componentsAreRegistered = false
    }

    @JavascriptInterface
    fun bridgeDidInitialize() {
        log("bridge initialized")
        runOnUiThread {
            delegate?.bridgeDidInitialize()
        }
    }

    @JavascriptInterface
    fun bridgeDidUpdateSupportedComponents() {
        log("bridge components registered")
        componentsAreRegistered = true
    }

    @JavascriptInterface
    fun bridgeDidReceiveMessage(message: String?) {
        log("message received: $message")
        runOnUiThread {
            Message.fromJSON(message)?.let {
                delegate?.bridgeDidReceiveMessage(it)
            }
        }
    }

    // Internal

    internal fun userScript(): String {
        return repository.getUserScript(webView.context)
    }

    internal fun evaluate(javascript: String) {
        log("evaluating $javascript")
        webView.evaluateJavascript(javascript) {}
    }

    internal fun generateJavaScript(bridgeFunction: String, vararg arguments: Any): String {
        val functionName = sanitizeFunctionName(bridgeFunction)
        val encodedArguments = encode(arguments.toList())
        return "$bridgeGlobal.$functionName($encodedArguments)"
    }

    internal fun encode(arguments: List<Any>): String {
        val gson = GsonBuilder().disableHtmlEscaping().create()
        return arguments.joinToString(",") { gson.toJson(it) }
    }

    internal fun sanitizeFunctionName(name: String): String {
        return name.removeSuffix("()")
    }
}
