export interface LocalInvoice {
  invoiceRef: string
  billingCustomerId: string
  totalFormatted: string
  invoiceStatus: 'pending' | 'paid' | 'void'
  issuedAt: string
}
