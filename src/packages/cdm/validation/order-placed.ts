import orderPlacedSchema from '../generated/order-placed.schema.json' with { type: 'json' }
import type { OrderPlaced } from '../generated/order-placed.types'
import { ajv } from './ajv-instance'
import type { ValidationResult } from './types'

const validateOrderPlaced = ajv.compile<OrderPlaced>(orderPlacedSchema)

export function validateCanonicalOrderPlaced(
  data: unknown
): ValidationResult<OrderPlaced> {
  const valid = validateOrderPlaced(data)

  if (valid) {
    return { ok: true, data: data as OrderPlaced }
  }

  const errors = (validateOrderPlaced.errors ?? []).map(err => {
    const path = err.instancePath || '/'
    return `${path}: ${err.message ?? 'unknown error'}`
  })

  return { ok: false, errors }
}
