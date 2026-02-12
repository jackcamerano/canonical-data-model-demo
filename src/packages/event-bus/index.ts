import { EventEmitter } from 'node:events'

export interface DeadLetterEntry {
  topic: string
  message: unknown
  reason: string
  timestamp: string
}

type Handler = (message: unknown) => void

export class EventBus {
  private emitter = new EventEmitter()
  private dlq: DeadLetterEntry[] = []

  publish(topic: string, message: unknown): void {
    const listenerCount = this.emitter.listenerCount(topic)
    if (listenerCount === 0) {
      console.warn(
        `[event-bus] No subscribers for "${topic}" - message dropped`
      )
      return
    }

    console.log(
      `[event-bus] Publishing to "${topic}" (${listenerCount} subscriber(s))`
    )
    this.emitter.emit(topic, message)
  }

  subscribe(topic: string, handler: Handler): void {
    console.log(`[event-bus] Subscribed to "${topic}"`)
    this.emitter.on(topic, (message: unknown) => {
      try {
        handler(message)
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        console.error(`[event-bus] Handler error on "${topic}": ${reason}`)
        this.sendToDLQ(topic, message, reason)
      }
    })
  }

  sendToDLQ(topic: string, message: unknown, reason: string): void {
    const entry: DeadLetterEntry = {
      topic,
      message,
      reason,
      timestamp: new Date().toISOString()
    }
    this.dlq.push(entry)
    console.log(`[event-bus] DLQ entry added for "${topic}": ${reason}`)
  }

  getDLQ(): ReadonlyArray<DeadLetterEntry> {
    return this.dlq
  }

  clearDLQ(): void {
    this.dlq.length = 0
  }
}
