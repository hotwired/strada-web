import { Message } from "./helpers/types"

export interface Adapter {
  platform: string

  supportedComponents: string[]
  supportsComponent(component: String): boolean

  receive(message: Message): void
}
