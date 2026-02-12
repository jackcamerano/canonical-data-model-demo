import type { EventBus } from '../../packages/event-bus/index'
import { logErrors } from '../../packages/logging/index'
import { toCanonicalOrderPlaced } from './adapter'
import type { LocalOrder } from './types'

const TOPIC = 'order-placed'

export function publishOrder(bus: EventBus, localOrder: LocalOrder): void {
  console.log(`\n[producer-a] Processing order "${localOrder.order_id}"`)

  const result = toCanonicalOrderPlaced(localOrder)

  if (!result.ok) {
    console.log('[producer-a] Validation FAILED:')
    logErrors(result.errors)
    bus.sendToDLQ(TOPIC, localOrder, result.errors.join('; '))
    return
  }

  console.log('[producer-a] Validation passed, publishing canonical event')
  bus.publish(TOPIC, result.data)
}
