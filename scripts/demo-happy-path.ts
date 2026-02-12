import { subscribeToOrders } from '../src/apps/consumer-b/index'
import { publishOrder } from '../src/apps/producer-a/index'
import type { LocalOrder } from '../src/apps/producer-a/types'
import { EventBus } from '../src/packages/event-bus/index'
import { printDLQSummary } from '../src/packages/logging/index'

console.log('=== CDM Demo: Happy Path ===\n')

const bus = new EventBus()

subscribeToOrders(bus)

const order: LocalOrder = {
  order_id: 'ORD-1001',
  customer_id: 'CUST-42',
  total_amount: 149.99,
  currency_code: 'USD',
  status: 'P',
  created_at: Date.now()
}

publishOrder(bus, order)

printDLQSummary(bus)

console.log('\n=== Done ===')
