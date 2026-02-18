export interface LocalInvoice {
  invoiceRef: string
  billingCustomerId: string
  totalFormatted: string // Amount and currency combined (e.g. "149.99 USD")
  invoiceStatus: 'pending' | 'paid' | 'void'
  issuedAt: string // ISO 8601 timestamp
}
