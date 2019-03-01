import Bridge from "./bridge"

declare global {
  interface Window {
    WebBridge: Bridge
  }
}

const bridge = new Bridge()
window.WebBridge = bridge
bridge.start()
