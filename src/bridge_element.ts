import { BridgeComponent } from "./bridge_component"

export class BridgeElement {
  element: Element

  constructor(element: Element) {
    this.element = element
  }

  get title() {
    return (
      this.bridgeAttribute("title") ||
      this.attribute("aria-label") ||
      this.element.textContent ||
      (<HTMLInputElement>this.element).value
    ).trim()
  }

  get enabled() {
    return !this.disabled
  }

  get disabled() {
    const disabled = this.bridgeAttribute("disabled")
    return disabled === "true" || disabled === this.platform
  }

  enableForComponent(component: BridgeComponent) {
    if (component.enabled) {
      this.removeBridgeAttribute("disabled")
    }
  }

  hasClass(className: string) {
    return this.element.classList.contains(className)
  }

  attribute(name: string) {
    return this.element.getAttribute(name)
  }

  bridgeAttribute(name: string) {
    return this.attribute(`data-bridge-${name}`)
  }

  setBridgeAttribute(name: string, value: any) {
    this.element.setAttribute(`data-bridge-${name}`, value)
  }

  removeBridgeAttribute(name: string) {
    this.element.removeAttribute(`data-bridge-${name}`)
  }

  click() {
    // Remove the target attribute before clicking to avoid an
    // issue in Android WebView that prevents a target="_blank"
    // url from being obtained from a javascript click.
    if (this.platform == "android") {
      this.element.removeAttribute("target")
    }

    (<HTMLElement>this.element).click()
  }

  get platform() {
    return document.documentElement.dataset.bridgePlatform
  }
}
