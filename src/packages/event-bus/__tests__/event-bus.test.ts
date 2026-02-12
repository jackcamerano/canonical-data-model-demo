import { describe, expect, it, vi } from 'vitest'
import { EventBus } from '../index'

describe('EventBus', () => {
  it('delivers a message to a subscriber', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.subscribe('orders', handler)
    bus.publish('orders', { id: 1 })

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ id: 1 })
  })

  it('delivers to multiple subscribers on the same topic', () => {
    const bus = new EventBus()
    const handlerA = vi.fn()
    const handlerB = vi.fn()

    bus.subscribe('orders', handlerA)
    bus.subscribe('orders', handlerB)
    bus.publish('orders', { id: 1 })

    expect(handlerA).toHaveBeenCalledOnce()
    expect(handlerB).toHaveBeenCalledOnce()
  })

  it('does not deliver to subscribers on a different topic', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.subscribe('invoices', handler)
    bus.publish('orders', { id: 1 })

    expect(handler).not.toHaveBeenCalled()
  })

  it('drops the message when there are no subscribers', () => {
    const bus = new EventBus()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    bus.publish('orders', { id: 1 })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No subscribers for "orders"')
    )
    warnSpy.mockRestore()
  })

  it('catches a throwing handler and routes to DLQ', () => {
    const bus = new EventBus()

    bus.subscribe('orders', () => {
      throw new Error('handler blew up')
    })
    bus.publish('orders', { id: 1 })

    const dlq = bus.getDLQ()
    expect(dlq).toHaveLength(1)
    expect(dlq[0]?.topic).toBe('orders')
    expect(dlq[0]?.reason).toBe('handler blew up')
    expect(dlq[0]?.message).toEqual({ id: 1 })
  })

  it('does not break other subscribers when one throws', () => {
    const bus = new EventBus()
    const goodHandler = vi.fn()

    bus.subscribe('orders', () => {
      throw new Error('bad handler')
    })
    bus.subscribe('orders', goodHandler)
    bus.publish('orders', { id: 1 })

    expect(goodHandler).toHaveBeenCalledOnce()
    expect(bus.getDLQ()).toHaveLength(1)
  })

  it('clearDLQ empties the dead letter queue', () => {
    const bus = new EventBus()

    bus.sendToDLQ('orders', { id: 1 }, 'test reason')
    expect(bus.getDLQ()).toHaveLength(1)

    bus.clearDLQ()
    expect(bus.getDLQ()).toHaveLength(0)
  })
})
