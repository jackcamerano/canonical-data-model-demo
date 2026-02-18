export interface LocalOrder {
  order_id: string
  customer_id: string
  total_amount: number // Decimal number (e.g. 149.99)
  currency_code: string // ISO 4217 currency code (e.g. "USD", "EUR")
  status: string // Known codes: P (placed), C (confirmed), S (shipped), D (delivered), X (cancelled)
  created_at: number // Unix milliseconds
}
