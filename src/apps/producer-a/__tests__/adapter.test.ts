import { describe, expect, it } from 'vitest'
import { toCanonicalOrderPlaced } from '../adapter'
import type { LocalOrder } from '../types'

function makeValidLocalOrder(overrides: Partial<LocalOrder> = {}): LocalOrder {
  return {
    order_id: 'ORD-001',
    customer_id: 'CUST-42',
    total_amount: 149.99,
    currency_code: 'USD',
    status: 'P',
    created_at: 1707500000000,
    ...overrides
  }
}

describe('Producer A adapter: toCanonicalOrderPlaced', () => {
  it('maps a valid LocalOrder to a canonical OrderPlaced event', () => {
    const result = toCanonicalOrderPlaced(makeValidLocalOrder())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.order.orderId).toBe('ORD-001')
    expect(result.data.order.customerId).toBe('CUST-42')
    expect(result.data.order.amount.value).toBe('149.99')
    expect(result.data.order.amount.currency).toBe('USD')
    expect(result.data.order.status).toBe('placed')
    expect(result.data.source.system).toBe('producer-a')
    expect(result.data.eventId).toBeDefined()
    expect(result.data.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('converts all known status codes correctly', () => {
    const mapping: Record<string, string> = {
      P: 'placed',
      C: 'confirmed',
      S: 'shipped',
      D: 'delivered',
      X: 'cancelled'
    }

    Object.entries(mapping).forEach(([code, expected]) => {
      const result = toCanonicalOrderPlaced(
        makeValidLocalOrder({ status: code })
      )
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.order.status).toBe(expected)
      }
    })
  })

  it('rejects an unknown status code', () => {
    const result = toCanonicalOrderPlaced(makeValidLocalOrder({ status: 'R' }))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0]).toContain('Unknown producer status code "R"')
    }
  })

  it('rejects when currency_code is empty (schema validation: minLength 3)', () => {
    const result = toCanonicalOrderPlaced(
      makeValidLocalOrder({ currency_code: '' })
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('currency'))).toBe(true)
    }
  })

  it('rejects when currency_code is too short', () => {
    const result = toCanonicalOrderPlaced(
      makeValidLocalOrder({ currency_code: 'US' })
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('currency'))).toBe(true)
    }
  })

  it('formats amount to 2 decimal places', () => {
    const result = toCanonicalOrderPlaced(
      makeValidLocalOrder({ total_amount: 10 })
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.order.amount.value).toBe('10.00')
    }
  })

  it('converts unix timestamp to ISO 8601', () => {
    const result = toCanonicalOrderPlaced(
      makeValidLocalOrder({ created_at: 1707500000000 })
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(() => new Date(result.data.occurredAt)).not.toThrow()
      expect(new Date(result.data.occurredAt).getTime()).toBe(1707500000000)
    }
  })
})
