import type { EventBus } from '../../packages/event-bus/index'
import { logErrors } from '../../packages/logging/index'
import { fromCanonicalOrderPlaced } from './adapter'

const TOPIC = 'order-placed'

export function subscribeToOrders(bus: EventBus): void {
  bus.subscribe(TOPIC, (message: unknown) => {
    console.log('\n[consumer-b] Received canonical event')

    const result = fromCanonicalOrderPlaced(message)

    if (!result.ok) {
      console.log('[consumer-b] Validation FAILED:')
      logErrors(result.errors)
      bus.sendToDLQ(TOPIC, message, result.errors.join('; '))
      return
    }

    console.log('[consumer-b] Mapped to LocalInvoice:')
    console.log(JSON.stringify(result.data, null, 2))
  })
}
