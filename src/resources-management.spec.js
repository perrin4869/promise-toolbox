/* eslint-env jest */

import { disposer, using } from './'
import { noop, reject, rejectionOf } from './fixtures'

describe('disposer()', () => {
  it('called with flat params', async () => {
    const d1 = jest.fn()
    const p1 = Promise.resolve('p1')::disposer(d1)
    const p2 = Promise.resolve('p2')
    const handler = jest.fn(() => 'handler')

    expect(await using(p1, p2, handler)).toBe('handler')
    expect(handler.mock.calls).toEqual([ [ 'p1', 'p2' ] ])
    expect(d1.mock.calls).toEqual([ [ 'p1' ] ])
  })

  it('called with array param', async () => {
    const d1 = jest.fn()
    const p1 = Promise.resolve('p1')::disposer(d1)
    const p2 = Promise.resolve('p2')
    const handler = jest.fn(() => 'handler')

    expect(await using([ p1, p2 ], handler)).toBe('handler')
    expect(handler.mock.calls).toEqual([ [ [ 'p1', 'p2' ] ] ])
    expect(d1.mock.calls).toEqual([ [ 'p1' ] ])
  })

  it('a resource can only be used once', async () => {
    const d1 = jest.fn()
    const p1 = Promise.resolve('p1')::disposer(d1)
    const handler = jest.fn()

    await using(p1, handler)
    handler.mockClear()
    d1.mockClear()

    const d2 = jest.fn()
    const p2 = Promise.resolve('p2')::disposer(d2)

    expect(await rejectionOf(using(p1, p2, noop))).toBeInstanceOf(TypeError)
    expect(handler).not.toHaveBeenCalled()
    expect(d1).not.toHaveBeenCalled()
    expect(d2).toHaveBeenCalledTimes(1)
  })

  it('error in a provider', async () => {
    const d1 = jest.fn()
    const p1 = Promise.resolve('p1')::disposer(d1)
    const d2 = jest.fn()
    const p2 = reject('p2')::disposer(d2)
    const p3 = Promise.resolve('p3')
    const handler = jest.fn()

    expect(await rejectionOf(using(p1, p2, p3, handler))).toBe('p2')
    expect(handler).not.toHaveBeenCalled()
    expect(d1.mock.calls).toEqual([ [ 'p1' ] ])
    expect(d2).not.toHaveBeenCalled()
  })

  it('error in handler', async () => {
    const d1 = jest.fn()
    const p1 = Promise.resolve('p1')::disposer(d1)
    const d2 = jest.fn()
    const p2 = Promise.resolve('p2')::disposer(d2)
    const p3 = Promise.resolve('p3')
    const handler = jest.fn(() => reject('handler'))

    expect(await rejectionOf(using(p1, p2, p3, handler))).toBe('handler')
    expect(handler.mock.calls).toEqual([ [ 'p1', 'p2', 'p3' ] ])
    expect(d1.mock.calls).toEqual([ [ 'p1' ] ])
    expect(d2.mock.calls).toEqual([ [ 'p2' ] ])
  })

  it('error in a disposer')
})
