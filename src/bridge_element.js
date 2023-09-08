import { BridgeComponent } from "./bridge_component"

export class BridgeElement {
  constructor(element) {
    this.element = element
  }

  get title() {
    return (
      this.bridgeAttribute("title") ||
      this.attribute("aria-label") ||
      this.element.textContent ||
      this.element.value
    ).trim()
  }

  get enabled() {
    return !this.disabled
  }

  get disabled() {
    const disabled = this.bridgeAttribute("disabled")
    return disabled === "true" || disabled === this.platform
  }

  enableForComponent(component) {
    if (component.enabled) {
      this.removeBridgeAttribute("disabled")
    }
  }

  hasClass(className) {
    return this.element.classList.contains(className)
  }

  attribute(name) {
    return this.element.getAttribute(name)
  }

  bridgeAttribute(name) {
    return this.attribute(`data-bridge-${name}`)
  }

  setBridgeAttribute(name, value) {
    this.element.setAttribute(`data-bridge-${name}`, value)
  }

  removeBridgeAttribute(name) {
    this.element.removeAttribute(`data-bridge-${name}`)
  }

  click() {
    // Remove the target attribute before clicking to avoid an
    // issue in Android WebView that prevents a target="_blank"
    // url from being obtained from a javascript click.
    if (this.platform == "android") {
      this.element.removeAttribute("target")
    }

    this.element.click()
  }

  get platform() {
    return document.documentElement.dataset.bridgePlatform
  }
}
