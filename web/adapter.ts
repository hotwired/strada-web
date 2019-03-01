import { Message } from "./message"

export interface Adapter {
  platform: string

  supportedComponents: string[]
  supportsComponent(component: String): boolean

  receive(message: Message): void
}
