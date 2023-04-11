export interface Message {
  id: string
  component: string
  event: string
  data: object
}

export type MessageCallback = (message: Message) => void
