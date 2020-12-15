import { Controller } from "stimulus"
import { Bridge } from "./bridge"
import { BridgeElement } from "./bridge_element"

export class Component extends Controller {
  static component = ""

  pendingMessageCallbacks: Array<any>

  initialize() {
    this.pendingMessageCallbacks = []
  }

  connect() {
  }

  disconnect() {
    this.removePendingCallbacks()
    this.removePendingMessages()
  }

  get component() {
    return (<typeof Component>this.constructor).component
  }

  get enabled() {
    return window.Strada.supportsComponent(this.component)
  }

  send(event, data: any = {}, callback) {
    // Include the url with each message, so the native app can
    // ensure messages are delivered to the correct destination
    data.metadata = {
      url: window.location.href
    }

    const message = { component: this.component, event, data, callback }
    const messageId = this.bridge.send(message)
    if (callback) {
      // Track messages that we have callbacks for so we can clean up when disconnected
      this.pendingMessageCallbacks.push(messageId)
    }
  }

  removePendingCallbacks() {
    this.pendingMessageCallbacks.forEach(messageId => this.bridge.removeCallbackFor(messageId))
  }

  removePendingMessages() {
    this.bridge.removePendingMessagesFor(this.component)
  }

  get bridgeElement() {
    return new BridgeElement(this.element)
  }

  get bridge(): Bridge {
    return window.Strada.web
  }
}
