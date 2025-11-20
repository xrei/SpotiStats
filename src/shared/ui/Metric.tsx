import type {JSX} from 'solid-js'
import clsx from 'clsx'

type MetricSize = 'default' | 'hero'

type RootProps = {class?: string; children: JSX.Element}
type Slot = {class?: string; children: JSX.Element}
type TitleProps = Slot & {title?: string}
type ValueProps = Slot & {size?: MetricSize; nowrap?: boolean}

type MetricComponent = ((p: RootProps) => JSX.Element) & {
  Label: (p: Slot) => JSX.Element
  Title: (p: TitleProps) => JSX.Element
  Value: (p: ValueProps) => JSX.Element
  Sub: (p: Slot) => JSX.Element
}

export const Metric = ((p: RootProps) => (
  <div class={clsx('flex min-w-0', p.class)} style={{'container-type': 'inline-size'}}>
    <div class="flex w-full flex-col gap-1">{p.children}</div>
  </div>
)) as MetricComponent

Metric.Label = (p: Slot) => (
  <span
    class={clsx(
      'text-text-muted font-semibold',
      'text-[clamp(0.8rem,2cqi,1.5rem)]',
      p.class,
    )}
  >
    {p.children}
  </span>
)

Metric.Title = (p: TitleProps) => (
  <span
    title={p.title}
    class={clsx(
      'text-text-strong truncate font-semibold',
      'text-[clamp(1rem,3.2cqi,1.5rem)]',
      p.class,
    )}
  >
    {p.children}
  </span>
)

Metric.Value = (p: ValueProps) => {
  const fluid =
    p.size === 'hero'
      ? 'text-[clamp(1.25rem,12cqi,2rem)]'
      : 'text-[clamp(1rem,1.4vw,2rem)]'

  return (
    <div
      class={clsx(
        'text-text-strong leading-tight font-semibold tabular-nums',
        // 'flex h-full min-w-0 items-end',
        p.nowrap !== false && 'whitespace-nowrap',
        p.size === 'hero' ? 'overflow-visible' : 'truncate',
        fluid,
        p.class,
      )}
    >
      {p.children}
    </div>
  )
}

Metric.Sub = (p: Slot) => (
  <span class={clsx('text-text tabular-nums', 'text-[clamp(1rem,4cqi,1rem)]', p.class)}>
    {p.children}
  </span>
)
