import { v4 as uuidv4 } from 'uuid'
import {
  type OrderPlaced,
  type ValidationResult,
  validateCanonicalOrderPlaced
} from '../../packages/cdm/index'
import type { LocalOrder } from './types'

const STATUS_MAP: Record<string, OrderPlaced['order']['status']> = {
  P: 'placed',
  C: 'confirmed',
  S: 'shipped',
  D: 'delivered',
  X: 'cancelled'
}

export function toCanonicalOrderPlaced(
  local: LocalOrder
): ValidationResult<OrderPlaced> {
  const canonicalStatus = STATUS_MAP[local.status]
  if (!canonicalStatus) {
    return {
      ok: false,
      errors: [
        `Unknown producer status code "${local.status}". Known codes: ${Object.keys(STATUS_MAP).join(', ')}`
      ]
    }
  }

  const candidate: OrderPlaced = {
    eventId: uuidv4(),
    occurredAt: new Date(local.created_at).toISOString(),
    source: {
      system: 'producer-a',
      version: '1.0.0'
    },
    order: {
      orderId: local.order_id,
      customerId: local.customer_id,
      amount: {
        value: local.total_amount.toFixed(2),
        currency: local.currency_code
      },
      status: canonicalStatus
    }
  }

  return validateCanonicalOrderPlaced(candidate)
}
