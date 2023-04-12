import { Bridge } from "./bridge"
export { Component } from "./component"
export { BridgeElement } from "./bridge_element"

declare global {
  interface Window {
    Strada: { web: Bridge }
  }
}

if (!window.Strada) {
  const webBridge = new Bridge()
  window.Strada = { web: webBridge }
  webBridge.start()
}
