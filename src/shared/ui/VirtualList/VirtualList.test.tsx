import {describe, it, expect, beforeAll, afterAll, vi} from 'vitest'
import {render, screen} from '@solidjs/testing-library'
import {createSignal} from 'solid-js'
import {VirtualList} from './VirtualList'

beforeAll(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  }))

  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => 600,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 600,
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => 600,
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
    configurable: true,
    get: () => 0,
    set: () => {},
  })
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('VirtualList', () => {
  it('should re-render when items signal changes (search filter)', async () => {
    const [items, setItems] = createSignal([
      {id: 1, name: 'Alpha'},
      {id: 2, name: 'Beta'},
      {id: 3, name: 'Charlie'},
    ])

    render(() => (
      <VirtualList items={items} estimateSize={50} getItemKey={(item) => item.id}>
        {(item) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
      </VirtualList>
    ))

    await new Promise((r) => setTimeout(r, 50))

    expect(screen.queryByText('Alpha')).toBeTruthy()
    expect(screen.queryByText('Beta')).toBeTruthy()
    expect(screen.queryByText('Charlie')).toBeTruthy()

    // Simulate search filter
    setItems([{id: 2, name: 'Beta'}])

    await new Promise((r) => setTimeout(r, 50))

    expect(screen.queryByText('Alpha')).toBeNull()
    expect(screen.queryByText('Beta')).toBeTruthy()
    expect(screen.queryByText('Charlie')).toBeNull()
  })

  it('should update when items replaced with different set', async () => {
    const [items, setItems] = createSignal([
      {id: 1, name: 'First'},
      {id: 2, name: 'Second'},
    ])

    render(() => (
      <VirtualList items={items} estimateSize={50} getItemKey={(item) => item.id}>
        {(item) => <div>{item.name}</div>}
      </VirtualList>
    ))

    await new Promise((r) => setTimeout(r, 50))

    expect(screen.queryByText('First')).toBeTruthy()
    expect(screen.queryByText('Second')).toBeTruthy()

    setItems([
      {id: 10, name: 'New One'},
      {id: 20, name: 'New Two'},
    ])

    await new Promise((r) => setTimeout(r, 50))

    expect(screen.queryByText('First')).toBeNull()
    expect(screen.queryByText('Second')).toBeNull()
    expect(screen.queryByText('New One')).toBeTruthy()
    expect(screen.queryByText('New Two')).toBeTruthy()
  })
})
