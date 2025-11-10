import clsx from 'clsx'

export const ENTITY_ROW_HEIGHT = 72
export const ENTITY_ROW_SELECTOR = '[data-entity-row="true"]'

export const entityRowBaseClasses = clsx(
  'group relative rounded-md pl-1 pr-3 py-2 outline-none focus:outline-none focus-visible:outline-1 focus-visible:outline-accent focus:bg-surface-hover focus-within:bg-surface-hover hover:bg-surface-hover/50 active:bg-surface-hover',
)

type GetElement = () => HTMLElement | undefined

const queryRowLink = (row: HTMLElement) =>
  row.querySelector<HTMLElement>('[data-entity-link]') ?? null

const focusRowElement = (row: HTMLElement, mode: 'row' | 'link') => {
  const target = mode === 'link' ? (queryRowLink(row) ?? row) : row
  target.focus()
}

const focusAdjacentRow = (current: HTMLElement, direction: 1 | -1) => {
  const parent = current.parentElement
  if (!parent) return
  const rows = Array.from(parent.querySelectorAll<HTMLElement>(ENTITY_ROW_SELECTOR))
  const index = rows.indexOf(current)
  if (index === -1) return
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= rows.length) return
  focusRowElement(rows[nextIndex], 'link')
}

export const createEntityRowNavigation = (getRow: GetElement, getLink: GetElement) => {
  const handleRowKeyDown = (event: KeyboardEvent) => {
    const row = getRow()
    if (!row) return
    const link = getLink()

    const rowHandlers: Record<string, (event: KeyboardEvent) => boolean> = {
      ArrowLeft: () => {
        focusRowElement(row, 'link')
        return true
      },
      ArrowDown: () => {
        focusAdjacentRow(row, 1)
        return true
      },
      ArrowUp: () => {
        focusAdjacentRow(row, -1)
        return true
      },
      ArrowRight: () => {
        if (link) link.focus()
        else focusRowElement(row, 'link')
        return true
      },
      Enter: (evt) => {
        if (!link) return false
        if (evt.target instanceof HTMLElement && evt.target.closest('a')) return false
        link.click()
        return true
      },
    }

    const handler = rowHandlers[event.key]
    if (handler && handler(event)) event.preventDefault()
  }

  const handleLinkKeyDown = (event: KeyboardEvent) => {
    const row = getRow()
    if (!row) return

    const linkHandlers: Record<string, (event: KeyboardEvent) => boolean> = {
      ArrowLeft: () => {
        focusRowElement(row, 'link')
        return true
      },
      ArrowDown: () => {
        focusAdjacentRow(row, 1)
        return true
      },
      ArrowUp: () => {
        focusAdjacentRow(row, -1)
        return true
      },
      ArrowRight: () => {
        focusRowElement(row, 'link')
        return true
      },
    }

    const handler = linkHandlers[event.key]
    if (handler && handler(event)) event.preventDefault()
  }

  return {
    handleRowKeyDown,
    handleLinkKeyDown,
  }
}

export const createEntityListNavigation = (getContainer: GetElement) => {
  const focusRow = (container: HTMLElement, position: 'start' | 'end') => {
    const rows = Array.from(container.querySelectorAll<HTMLElement>(ENTITY_ROW_SELECTOR))
    if (rows.length === 0) return
    const target = position === 'start' ? rows[0] : rows[rows.length - 1]
    focusRowElement(target, 'link')
  }

  const handleContainerKeyDown = (event: KeyboardEvent) => {
    const container = getContainer()
    if (!container || event.target !== container) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusRow(container, 'start')
        break
      case 'ArrowUp':
        event.preventDefault()
        focusRow(container, 'end')
        break
    }
  }

  return {handleContainerKeyDown}
}
