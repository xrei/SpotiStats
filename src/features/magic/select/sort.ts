const toNumber = (value: number | null | undefined) => value ?? 0

export const numberDesc =
  <Row>(get: (row: Row) => number | null | undefined) =>
  (a: Row, b: Row) =>
    toNumber(get(b)) - toNumber(get(a))

export const stringAsc =
  <Row>(get: (row: Row) => string) =>
  (a: Row, b: Row) =>
    get(a).localeCompare(get(b))

export const applyOrder =
  <Row>(comparator: (a: Row, b: Row) => number, order: 'asc' | 'desc') =>
  (a: Row, b: Row) =>
    (order === 'asc' ? -1 : 1) * comparator(a, b)

export const composeComparators =
  <Row>(comparators: Array<(a: Row, b: Row) => number>) =>
  (a: Row, b: Row) => {
    for (const cmp of comparators) {
      const result = cmp(a, b)
      if (result !== 0) return result
    }
    return 0
  }
