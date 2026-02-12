/* Auto-generated from order-placed.schema.yaml -- do not edit manually */

/**
 * Canonical event emitted when an order is placed. All systems produce/consume this shape at integration boundaries.
 *
 */
export interface OrderPlaced {
  /**
   * Unique identifier for this event instance
   */
  eventId: string;
  /**
   * ISO 8601 timestamp of when the event occurred
   */
  occurredAt: string;
  source: {
    /**
     * Identifier of the producing system
     */
    system: string;
    /**
     * Semver schema version the producer is targeting (e.g. "1.0.0")
     */
    version: string;
  };
  order: {
    orderId: string;
    customerId: string;
    amount: {
      /**
       * Decimal string representation of the amount (e.g. "149.99"). String avoids IEEE 754 floating-point precision issues.
       *
       */
      value: string;
      /**
       * ISO 4217 currency code (e.g. "USD", "EUR")
       */
      currency: string;
    };
    /**
     * Canonical order status
     */
    status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  };
}
