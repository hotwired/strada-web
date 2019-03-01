(() => {
  // This represents the adapter that is installed on the WebBridge
  // All adapters implement the same interface so the web doesn't need to
  // know anything specific about the client platform
  class NativeBridge {
    constructor() {
      this.supportedComponents = []
      document.addEventListener("web-bridge:ready", () => this.webBridge.setAdapter(this))
    }

    register(component) {
      if (Array.isArray(component)) {
        this.supportedComponents = this.supportedComponents.concat(component)
      } else {
        this.supportedComponents.push(component)
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

    notifyBridgeOfSupportedComponentsUpdate() {
      if (this.webBridge) {
        this.webBridge.adapterDidUpdateSupportedComponents()
      }
    }

    supportsComponent(component) {
      return this.supportedComponents.includes(component)
    }

    // Send message to web
    send(message) {
      if (this.webBridge) {
        this.webBridge.receive(message)
      }
    }

    // Receive from web
    receive(message) {
      this.postMessage(message)
    }

    get platform() {
      return "ios"
    }

    // Native handler

    postMessage(message) {
      webkit.messageHandlers.strata.postMessage(message)
    }

    // Web bridge global
    get webBridge() {
      return window.WebBridge
    }
  }

  const bridge = new NativeBridge()
  window.NativeBridge = bridge

  // Let the app know once the global has been set
  bridge.postMessage("ready")
})()
