import { subscribeToOrders } from '../src/apps/consumer-b/index'
import { publishOrder } from '../src/apps/producer-a/index'
import type { LocalOrder } from '../src/apps/producer-a/types'
import { EventBus } from '../src/packages/event-bus/index'
import { printDLQSummary } from '../src/packages/logging/index'

console.log('=== CDM Demo: Break Currency ===')
console.log(
  'Scenario: Producer A emits an order with an empty currency code.\n' +
    'The producer adapter should catch this via JSON Schema validation\n' +
    'and route the message to the DLQ.\n'
)

const bus = new EventBus()

subscribeToOrders(bus)

const brokenOrder: LocalOrder = {
  order_id: 'ORD-BAD-1',
  customer_id: 'CUST-42',
  total_amount: 99.99,
  currency_code: '', // empty -- violates minLength: 3
  status: 'P',
  created_at: Date.now()
}

publishOrder(bus, brokenOrder)

printDLQSummary(bus)

console.log('\n=== Done ===')
