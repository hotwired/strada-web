# Strata

Strata is a library that provides a bridge for communicating between native iOS/Android apps and web app embedded in a web view. The bridge allows bi-directional sending of messages with a standard format.


## Web
Strata for web can be installed through npm or yarn from the GitHub repo until the package is published:
```
yarn add https://github.com/basecamp/Strata
```

You can also load `web/dist/strata.js` manually in your page.

## iOS
Strata for iOS can be installed via Carthage:

```
github "basecamp/strata"
```

The primary object is `Bridge`. You create a `Bridge` and load it into your web view configuration:

```swift
let bridge = Bridge()
bridge.load(into: webViewConfiguration)
```

This injects the bundled strata.js file and setups everything needed for communicating with the web bridge.

### Receiving
To receive messages from the web bridge, you want to set a `delegate` on the bridge.

```swift
bridge.delegate = self

// BridgeDelegate
func bridgeDidInitialize() {
  // Configure your supported components
}

func bridgeDidReceiveMessage(_ message: Message) {
  // Inspect message and perform related actions
}
```

### Sending
You send over the bridge by creating a `Message` and calling `send`:

```swift
bridge.send(message)
```

This can be a new message, or a message previously received from the web bridge to "reply" to a message.


## Android
While this repository is still private, Strata for Android can be installed via Gradle. Point a custom Maven repository to the library artifacts in your `app/build.gradle` file:

```groovy
repositories {
  ...

  maven {
    def repo = 'strata'
    def branch = 'master'
    def path = 'android/strata/artifacts'
    url "https://raw.githubusercontent.com/basecamp/$repo/$branch/$path"
    authentication { basic(BasicAuthentication) }
    credentials { username <github-username>; password <github-access-token> }
  }
}
```

Then, include the Strata dependency in your `app/build.gradle` file using the `aar` library artifact:

```groovy
dependencies {
  implementation 'com.basecamp:strata:0.1@aar'
}
```

The primary object is `Bridge`. You create a `Bridge` using the `WebView` instance in your app:

```kotlin
val bridge = Bridge(webView)
```

Load the `Bridge` into the current `WebView` page when the `WebViewClient`'s `onPageFinished()` is called:

```kotlin
webView.webViewClient = object : WebViewClient() {
  override fun onPageFinished(view: WebView?, url: String?) {
    super.onPageFinished(view, url)
    bridge.load()
  }
}
```

This injects the bundled strata.js file and setups everything needed for communicating with the web bridge.

### Receiving
To receive messages from the web bridge, you want to set a `delegate` on the bridge.

```kotlin
bridge.delegate = this

// BridgeDelegate
override fun bridgeDidInitialize() {
  // Configure your supported components
}

override fun bridgeDidReceiveMessage(message: Message) {
  // Inspect message and perform related actions
}
```

### Sending
You send over the bridge by creating a `Message` and calling `send`:

```kotlin
bridge.send(message)
```

This can be a new message, or a message previously received from the web bridge to "reply" to a message.
