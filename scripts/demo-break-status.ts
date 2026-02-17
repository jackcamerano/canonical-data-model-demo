import { subscribeToOrders } from '../src/apps/consumer-b/index'
import { publishOrder } from '../src/apps/producer-a/index'
import type { LocalOrder } from '../src/apps/producer-a/types'
import { EventBus } from '../src/packages/event-bus/index'
import { printDLQSummary } from '../src/packages/logging/index'

console.log('=== CDM Demo: Break Status Enum ===')
console.log(
  'Scenario: Producer A emits an order with status "R" (refunded),\n' +
    'which has no mapping in the canonical status enum.\n' +
    'The producer adapter should reject it before it hits the bus.\n'
)

const bus = new EventBus()

subscribeToOrders(bus)

const brokenOrder: LocalOrder = {
  order_id: 'ORD-BAD-2',
  customer_id: 'CUST-42',
  total_amount: 250.0,
  currency_code: 'EUR',
  status: 'R', // "Refunded" -- not in the STATUS_MAP
  created_at: Date.now()
}

console.log('LocalOrder:', brokenOrder)

publishOrder(bus, brokenOrder)

printDLQSummary(bus)

console.log('\n=== Done ===')
