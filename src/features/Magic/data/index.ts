import type {StreamingEntry} from './entry'

const files = [
  '0.json',
  '1.json',
  '2.json',
  '3.json',
  '4.json',
  '5.json',
  '6.json',
  '7.json',
  '8.json',
  '9.json',
  '10.json',
  '11.json',
  '12.json',
]

export async function loadData(): Promise<StreamingEntry[][]> {
  const ps = files.map((fn) =>
    fetch(`/data/${fn}`).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${fn}`)
      return res.json() as Promise<StreamingEntry[]>
    }),
  )
  return Promise.all(ps)
}
