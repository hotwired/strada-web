import { Bridge } from "./bridge"
export { BridgeComponent } from "./bridge_component"
export { BridgeElement } from "./bridge_element"

if (!window.Strada) {
  const webBridge = new Bridge()
  window.Strada = { web: webBridge }
  webBridge.start()
}
