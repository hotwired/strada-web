import { Adapter } from "./adapter"
import { Message } from "./message"

type MessageCallback = (message: Message) => void
type MessageId = string
type PendingMessage = [ string, string, object, MessageCallback ]

export default class {
  private adapter: Adapter
  private lastMessageId: number
  private pendingMessages: Array<PendingMessage>
  private pendingCallbacks: Map<MessageId, MessageCallback>

  constructor() {
    this.adapter = null
    this.lastMessageId = 0
    this.pendingMessages = []
    this.pendingCallbacks = new Map()
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

  send(component: string, event: string, data: object, callback: MessageCallback): MessageId | null {
    if (!this.adapter) {
      const message: PendingMessage = [ component, event, data, callback ]
      this.pendingMessages.push(message)
      return
    }
    if (!this.supportsComponent(component)) return null

    const id = this.generateMessageId()
    const message: Message = { id: id, component: component, event: event, data: data || {} }
    this.adapter.receive(message)

    if (callback) {
      this.pendingCallbacks.set(id, callback)
    }

    return id
  }

  receive(message: Message) {
    this.executeCallbackFor(message)
  }

  executeCallbackFor(message: Message) {
    if (this.pendingCallbacks.has(message.id)) {
      const callback = this.pendingCallbacks.get(message.id)
      callback(message)
    }
  }

  removeCallbackFor(messageId: MessageId) {
    if (this.pendingCallbacks.has(messageId)) {
      this.pendingCallbacks.delete(messageId)
    }
  }

  generateMessageId(): MessageId {
    const id = ++this.lastMessageId
    return id.toString()
  }

  setAdapter(adapter: Adapter) {
    this.adapter = adapter

    // Configure <html> attributes
    document.documentElement.dataset.bridgePlatform = this.adapter.platform
    this.adapterDidUpdateSupportedComponents()
    this.sendPendingMessages()
  }

  adapterDidUpdateSupportedComponents() {
    document.documentElement.dataset.bridgeComponents = this.adapter.supportedComponents.join(" ")
  }

  private sendPendingMessages() {
    this.pendingMessages.forEach(message => this.send(...message))
    this.pendingMessages = []
  }
}
