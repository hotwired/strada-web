import { Controller } from "stimulus"
import { Bridge } from "./bridge"
import { BridgeElement } from "./bridge_element"
import { MessageCallback } from "./helpers/types"

export class Component extends Controller {
  static component = ""

  pendingMessageCallbacks: Array<any> = []

  initialize() {
    this.pendingMessageCallbacks = []
  }

  connect() {}

  disconnect() {
    this.removePendingCallbacks()
    this.removePendingMessages()
  }

  get component() {
    return (this.constructor as typeof Component).component
  }

  get platformOptingOut() {
    const { bridgePlatform } = document.documentElement.dataset
    return (
      this.identifier ==
      this.element.getAttribute(`data-controller-optout-${bridgePlatform}`)
    )
  }

  get enabled() {
    return (
      !this.platformOptingOut &&
      this.bridge.supportsComponent(this.component)
    )
  }

  send(event: any, data: any = {}, callback: MessageCallback | null) {
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
