import { Bridge } from "./bridge"
export { Component } from "./component"

declare global {
  interface Window {
    Strada: any
  }
}

if (!window.Strada) {
  window.Strada = {}
}

const webBridge = new Bridge()
window.Strada.web = webBridge
webBridge.start()
