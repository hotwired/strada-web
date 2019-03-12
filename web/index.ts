import Bridge from "./bridge"

declare global {
  interface Window {
    webBridge: Bridge
  }
}

const bridge = new Bridge()
window.webBridge = bridge
bridge.start()
