import { describe, expect, it } from 'vitest'
import type { OrderPlaced } from '../../generated/order-placed.types'
import { validateCanonicalOrderPlaced } from '../order-placed'

const validEvent: OrderPlaced = {
  eventId: '550e8400-e29b-41d4-a716-446655440000',
  occurredAt: '2024-02-09T19:33:20.000Z',
  source: { system: 'test-system', version: '1.0.0' },
  order: {
    orderId: 'ORD-001',
    customerId: 'CUST-42',
    amount: { value: '149.99', currency: 'USD' },
    status: 'placed'
  }
}

describe('validateCanonicalOrderPlaced', () => {
  it('accepts a valid event', () => {
    expect(validateCanonicalOrderPlaced(validEvent).ok).toBe(true)
  })

  it.each([null, undefined, 'string', {}, { eventId: 'bad' }])(
    'rejects invalid input: %j',
    input => {
      expect(validateCanonicalOrderPlaced(input).ok).toBe(false)
    }
  )

  it('rejects unknown top-level properties', () => {
    expect(validateCanonicalOrderPlaced({ ...validEvent, extra: 1 }).ok).toBe(
      false
    )
  })

  it('returns multiple errors for multiple violations', () => {
    const result = validateCanonicalOrderPlaced({
      eventId: 'bad',
      occurredAt: 'bad'
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.length).toBeGreaterThan(1)
  })
})
