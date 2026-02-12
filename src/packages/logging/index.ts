import type { EventBus } from '../event-bus/index'

export function logErrors(errors: string[]): void {
  errors.forEach(err => console.log(`  - ${err}`))
}

export function printDLQSummary(bus: EventBus): void {
  console.log('\n--- DLQ Summary ---')
  const dlq = bus.getDLQ()

  if (dlq.length === 0) {
    console.log('DLQ is empty. All messages processed successfully.')
    return
  }

  console.log(`DLQ has ${dlq.length} entry(ies):`)
  dlq.forEach(entry => {
    console.log(`  Topic:  ${entry.topic}`)
    console.log(`  Reason: ${entry.reason}`)
    console.log(`  Time:   ${entry.timestamp}`)
    console.log()
  })
}
