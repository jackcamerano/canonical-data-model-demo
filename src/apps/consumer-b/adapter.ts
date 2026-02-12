import {
  type OrderPlaced,
  type ValidationResult,
  validateCanonicalOrderPlaced
} from '../../packages/cdm/index'
import type { LocalInvoice } from './types'

const INVOICE_STATUS_MAP: Record<
  OrderPlaced['order']['status'],
  LocalInvoice['invoiceStatus']
> = {
  placed: 'pending',
  confirmed: 'pending',
  shipped: 'pending',
  delivered: 'paid',
  cancelled: 'void'
}

export function fromCanonicalOrderPlaced(
  data: unknown
): ValidationResult<LocalInvoice> {
  const validationResult = validateCanonicalOrderPlaced(data)
  if (!validationResult.ok) {
    return validationResult
  }

  const canonical = validationResult.data

  const invoiceStatus = INVOICE_STATUS_MAP[canonical.order.status]
  if (!invoiceStatus) {
    return {
      ok: false,
      errors: [
        `Unknown canonical status "${canonical.order.status}". Consumer B cannot map this.`
      ]
    }
  }

  const invoice: LocalInvoice = {
    invoiceRef: canonical.order.orderId,
    billingCustomerId: canonical.order.customerId,
    totalFormatted: `${canonical.order.amount.value} ${canonical.order.amount.currency}`,
    invoiceStatus,
    issuedAt: canonical.occurredAt
  }

  return { ok: true, data: invoice }
}
