(() => {
  // This represents the adapter that is installed on the webBridge
  // All adapters implement the same interface so the web doesn't need to
  // know anything specific about the client platform
  class NativeBridge {
    constructor() {
      this.supportedComponents = []
      this.adapterIsRegistered = false
    }

    register(component) {
      if (Array.isArray(component)) {
        this.supportedComponents = this.supportedComponents.concat(component)
      } else {
        this.supportedComponents.push(component)
      }

      if (!this.adapterIsRegistered) {
        this.registerAdapter()
      }
      this.notifyBridgeOfSupportedComponentsUpdate()
    }

    unregister(component) {
      const index = this.supportedComponents.indexOf(component)
      if (index != -1) {
        this.supportedComponents.splice(index, 1)
        this.notifyBridgeOfSupportedComponentsUpdate()
      }
    }

    registerAdapter() {
      this.adapterIsRegistered = true

      if (window.webBridge) {
        window.webBridge.setAdapter(this)
      } else {
        document.addEventListener("web-bridge:ready", () => window.webBridge.setAdapter(this))
      }
    }

    notifyBridgeOfSupportedComponentsUpdate() {
      this.supportedComponentsUpdated()

      if (window.webBridge) {
        window.webBridge.adapterDidUpdateSupportedComponents()
      }
    }

    supportsComponent(component) {
      return this.supportedComponents.includes(component)
    }

    // Send message to web
    send(message) {
      if (window.webBridge) {
        window.webBridge.receive(JSON.parse(message))
      }
    }

    // Receive from web
    receive(message) {
      this.postMessage(JSON.stringify(message))
    }

    get platform() {
      return "android"
    }

    // Native handler

    ready() {
      Strata.bridgeDidInitialize()
    }

    supportedComponentsUpdated() {
      Strata.bridgeDidRegisterSupportedComponents()
    }

    postMessage(message) {
      Strata.bridgeDidReceiveMessage(message)
    }
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initializeBridge()
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      initializeBridge()
    })
  }

  function initializeBridge() {
    window.nativeBridge = new NativeBridge()
    window.nativeBridge.ready()
  }
})()
