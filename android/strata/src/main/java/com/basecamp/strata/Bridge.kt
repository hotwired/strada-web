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
class Bridge(var webView: WebView? = null, var delegate: BridgeDelegate? = null) {
    internal var repository = Repository()

    fun register(component: String) {
        register(listOf(component))
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
        val webView = requireNotNull(webView) { "WebView must be provided to load strata.js" }
        webView.addJavascriptInterface(this, bridgeJavascriptInterface)
        evaluate(userScript())
    }

    @JavascriptInterface
    fun bridgeDidInitialize() {
        log("bridge initialized")
        delegate?.bridgeDidInitialize()
    }

    @JavascriptInterface
    fun bridgeDidReceiveMessage(message: String?) {
        log("message received: $message")
        Message.fromJSON(message)?.let {
            delegate?.bridgeDidReceiveMessage(it)
        }
    }

    // Internal

    internal fun userScript(): String {
        val context = requireNotNull(webView).context
        return repository.getUserScript(context)
    }

    internal fun evaluate(javascript: String) {
        log("evaluating $javascript")
        webView?.evaluateJavascript(javascript) { result ->
            log("javascript result: $result")
        }
    }

    internal fun generateJavaScript(bridgeFunction: String, argument: Any): String {
        return generateJavaScript(bridgeFunction, listOf(argument))
    }

    internal fun generateJavaScript(bridgeFunction: String, arguments: List<Any>): String {
        val functionName = sanitizeFunctionName(bridgeFunction)
        val encodedArguments = encode(arguments)
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
