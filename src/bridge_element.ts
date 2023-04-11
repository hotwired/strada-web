import { Component } from "./component"

export class BridgeElement {
  element: Element

  constructor(element: Element) {
    this.element = element
  }

  static makeMenuItems(elements: Element[]) {
    return elements.map((element, index) => new BridgeElement(element).menuItem(index)).filter(item => item)
  }

  static makeMenuGroups(elements: Element[]) {
    return elements.map(element => new BridgeElement(element).menuGroup())
  }

  get title() {
    return (
      this.bridgeAttribute("title") ||
      this.attribute("aria-label") ||
      this.element.textContent ||
      (<HTMLInputElement>this.element).value
    ).trim()
  }

  get icon() {
    const name = this.bridgeAttribute("icon-name")
    const url = this.bridgeAttribute(`icon-${this.platform}-url`)

    if (name || url) {
      return { name, url }
    } else {
      return null
    }
  }

  get group() {
    return this.bridgeAttribute("group") || "default"
  }

  get style() {
    return this.bridgeAttribute("style") || "default"
  }

  get selected() {
    return this.bridgeAttribute("selected") === "true"
  }

  get filterable() {
    return this.bridgeAttribute("filterable") === "true"
  }

  get enabled() {
    return !this.disabled
  }

  get disabled() {
    const disabled = this.bridgeAttribute("disabled")
    return disabled === "true" || disabled === this.platform
  }

  enableForComponent(component: Component) {
    if (component.enabled) {
      this.removeBridgeAttribute("disabled")
    }
  }

  get displayedOnPlatform() {
    return !this.hasClass(`u-hide@${this.platform}`)
  }

  showOnPlatform() {
    this.element.classList.remove(`u-hide@${this.platform}`)
  }

  hideOnPlatform() {
    this.element.classList.add(`u-hide@${this.platform}`)
  }

  get button() {
    return {
      title: this.title,
      icon: this.icon
    }
  }

  menuItem(index: number) {
    if (this.disabled) return null

    return {
      title: this.title,
      style: this.style,
      groupName: this.group,
      selected: this.selected,
      icon: this.icon,
      index: index
    }
  }

  menuGroup() {
    return {
      title: this.title,
      name: this.group
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
