import { Adapter } from "./adapter"
import { Message } from "./message"

export default class {
  private adapter: Adapter
  private messageId: number
  private handlers: object

  constructor() {
    this.adapter = null
    this.messageId = 0
    this.handlers = {}
  }

  start() {
    this.notifyApplicationAfterStart()
  }

  notifyApplicationAfterStart() {
    document.dispatchEvent(new Event("web-bridge:ready"))
  }

  supportsComponent(component: string): boolean {
    if (this.adapter) {
      return this.adapter.supportsComponent(component)
    } else {
      return false
    }
  }

  send(component: string, event: string, data: object, callback: (message: Message) => void): Message | null {
    if (!this.supportsComponent(component)) return null

    const id = this.generateMessageId()
    const message: Message = { id: id, component: component, event: event, data: data || {} }
    this.adapter.receive(message)

    if (callback) {
      this.handlers[id] = callback
    }

    return message
  }

  receive(message: Message) {
    this.executeHandlerFor(message)
    this.removeHandlerFor(message)
  }

  executeHandlerFor(message: Message) {
    const handler = this.handlers[message.id]
    if (handler) {
      handler(message)
    }
  }

  removeHandlerFor(message: Message) {
    const handler = this.handlers[message.id]
    if (handler) {
      delete this.handlers[message.id]
    }
  }

  generateMessageId(): string {
    const id = ++this.messageId
    return id.toString()
  }

  setAdapter(adapter: Adapter) {
    this.adapter = adapter

    // Configure <html> attributes
    document.documentElement.dataset.bridgePlatform = this.adapter.platform
    this.adapterDidUpdateSupportedComponents()
  }

  adapterDidUpdateSupportedComponents() {
    document.documentElement.dataset.bridgeComponents = this.adapter.supportedComponents.join(" ")
  }
}
