import { describe, expect, it } from 'vitest'
import type { OrderPlaced } from '../../../packages/cdm/generated/order-placed.types'
import { fromCanonicalOrderPlaced } from '../adapter'

function makeValidCanonical(overrides: Partial<OrderPlaced> = {}): OrderPlaced {
  return {
    eventId: '550e8400-e29b-41d4-a716-446655440000',
    occurredAt: '2024-02-09T19:33:20.000Z',
    source: { system: 'producer-a', version: '1.0.0' },
    order: {
      orderId: 'ORD-001',
      customerId: 'CUST-42',
      amount: { value: '149.99', currency: 'USD' },
      status: 'placed'
    },
    ...overrides
  }
}

describe('Consumer B adapter: fromCanonicalOrderPlaced', () => {
  it('maps a valid canonical event to a LocalInvoice', () => {
    const result = fromCanonicalOrderPlaced(makeValidCanonical())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.invoiceRef).toBe('ORD-001')
    expect(result.data.billingCustomerId).toBe('CUST-42')
    expect(result.data.totalFormatted).toBe('149.99 USD')
    expect(result.data.invoiceStatus).toBe('pending')
    expect(result.data.issuedAt).toBe('2024-02-09T19:33:20.000Z')
  })

  it('maps canonical statuses to invoice statuses correctly', () => {
    const mapping: Record<OrderPlaced['order']['status'], string> = {
      placed: 'pending',
      confirmed: 'pending',
      shipped: 'pending',
      delivered: 'paid',
      cancelled: 'void'
    }

    Object.entries(mapping).forEach(([canonical, expected]) => {
      const result = fromCanonicalOrderPlaced(
        makeValidCanonical({
          order: {
            ...makeValidCanonical().order,
            status: canonical as OrderPlaced['order']['status']
          }
        })
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.invoiceStatus).toBe(expected)
      }
    })
  })

  it('rejects an unknown canonical status (fails fast, DLQ scenario)', () => {
    const result = fromCanonicalOrderPlaced({
      ...makeValidCanonical(),
      order: { ...makeValidCanonical().order, status: 'refunded' }
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('status'))).toBe(true)
    }
  })

  it('rejects a message with missing required fields', () => {
    const result = fromCanonicalOrderPlaced({ eventId: 'abc' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })

  it('rejects a message with invalid amount format', () => {
    const result = fromCanonicalOrderPlaced({
      ...makeValidCanonical(),
      order: {
        ...makeValidCanonical().order,
        amount: { ...makeValidCanonical().order.amount, value: 'not-a-number' }
      }
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('value'))).toBe(true)
    }
  })
})
