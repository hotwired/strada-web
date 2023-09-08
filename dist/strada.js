/*
Strada 0.9.3
Copyright © 2023 37signals, LLC
*/
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/bridge.js
var Bridge = class {
  #adapter;
  #lastMessageId;
  #pendingMessages;
  #pendingCallbacks;
  constructor() {
    this.#adapter = null;
    this.#lastMessageId = 0;
    this.#pendingMessages = [];
    this.#pendingCallbacks = /* @__PURE__ */ new Map();
  }
  start() {
    this.notifyApplicationAfterStart();
  }
  notifyApplicationAfterStart() {
    document.dispatchEvent(new Event("web-bridge:ready"));
  }
  supportsComponent(component) {
    if (this.#adapter) {
      return this.#adapter.supportsComponent(component);
    } else {
      return false;
    }
  }
  send({ component, event, data, callback }) {
    if (!this.#adapter) {
      this.#savePendingMessage({ component, event, data, callback });
      return null;
    }
    if (!this.supportsComponent(component))
      return null;
    const id = this.generateMessageId();
    const message = { id, component, event, data: data || {} };
    this.#adapter.receive(message);
    if (callback) {
      this.#pendingCallbacks.set(id, callback);
    }
    return id;
  }
  receive(message) {
    this.executeCallbackFor(message);
  }
  executeCallbackFor(message) {
    const callback = this.#pendingCallbacks.get(message.id);
    if (callback) {
      callback(message);
    }
  }
  removeCallbackFor(messageId) {
    if (this.#pendingCallbacks.has(messageId)) {
      this.#pendingCallbacks.delete(messageId);
    }
  }
  removePendingMessagesFor(component) {
    this.#pendingMessages = this.#pendingMessages.filter((message) => message.component != component);
  }
  generateMessageId() {
    const id = ++this.#lastMessageId;
    return id.toString();
  }
  setAdapter(adapter) {
    this.#adapter = adapter;
    document.documentElement.dataset.bridgePlatform = this.#adapter.platform;
    this.adapterDidUpdateSupportedComponents();
    this.#sendPendingMessages();
  }
  adapterDidUpdateSupportedComponents() {
    if (this.#adapter) {
      document.documentElement.dataset.bridgeComponents = this.#adapter.supportedComponents.join(" ");
    }
  }
  #savePendingMessage(message) {
    this.#pendingMessages.push(message);
  }
  #sendPendingMessages() {
    this.#pendingMessages.forEach((message) => this.send(message));
    this.#pendingMessages = [];
  }
};

// src/bridge_component.js
import { Controller } from "@hotwired/stimulus";

// src/bridge_element.js
var BridgeElement = class {
  constructor(element) {
    this.element = element;
  }
  get title() {
    return (this.bridgeAttribute("title") || this.attribute("aria-label") || this.element.textContent || this.element.value).trim();
  }
  get enabled() {
    return !this.disabled;
  }
  get disabled() {
    const disabled = this.bridgeAttribute("disabled");
    return disabled === "true" || disabled === this.platform;
  }
  enableForComponent(component) {
    if (component.enabled) {
      this.removeBridgeAttribute("disabled");
    }
  }
  hasClass(className) {
    return this.element.classList.contains(className);
  }
  attribute(name) {
    return this.element.getAttribute(name);
  }
  bridgeAttribute(name) {
    return this.attribute(`data-bridge-${name}`);
  }
  setBridgeAttribute(name, value) {
    this.element.setAttribute(`data-bridge-${name}`, value);
  }
  removeBridgeAttribute(name) {
    this.element.removeAttribute(`data-bridge-${name}`);
  }
  click() {
    if (this.platform == "android") {
      this.element.removeAttribute("target");
    }
    this.element.click();
  }
  get platform() {
    return document.documentElement.dataset.bridgePlatform;
  }
};

// src/helpers/user_agent.js
var { userAgent } = window.navigator;
var isStradaNativeApp = /bridge-components: \[.+\]/.test(userAgent);

// src/bridge_component.js
var BridgeComponent = class extends Controller {
  static get shouldLoad() {
    return isStradaNativeApp;
  }
  pendingMessageCallbacks = [];
  initialize() {
    this.pendingMessageCallbacks = [];
  }
  connect() {
  }
  disconnect() {
    this.removePendingCallbacks();
    this.removePendingMessages();
  }
  get component() {
    return this.constructor.component;
  }
  get platformOptingOut() {
    const { bridgePlatform } = document.documentElement.dataset;
    return this.identifier == this.element.getAttribute(`data-controller-optout-${bridgePlatform}`);
  }
  get enabled() {
    return !this.platformOptingOut && this.bridge.supportsComponent(this.component);
  }
  send(event, data = {}, callback) {
    data.metadata = {
      url: window.location.href
    };
    const message = { component: this.component, event, data, callback };
    const messageId = this.bridge.send(message);
    if (callback) {
      this.pendingMessageCallbacks.push(messageId);
    }
  }
  removePendingCallbacks() {
    this.pendingMessageCallbacks.forEach((messageId) => this.bridge.removeCallbackFor(messageId));
  }
  removePendingMessages() {
    this.bridge.removePendingMessagesFor(this.component);
  }
  get bridgeElement() {
    return new BridgeElement(this.element);
  }
  get bridge() {
    return window.Strada.web;
  }
};
__publicField(BridgeComponent, "component", "");

// src/index.js
if (!window.Strada) {
  const webBridge = new Bridge();
  window.Strada = { web: webBridge };
  webBridge.start();
}
export {
  BridgeComponent,
  BridgeElement
};
