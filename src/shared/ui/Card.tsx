import type {JSX} from 'solid-js'
import clsx from 'clsx'

export const Card = (p: {class?: string; children: JSX.Element}) => (
  <section class={clsx('bg-surface-1 flex flex-col gap-4 rounded-xl p-5', p.class)}>
    {p.children}
  </section>
)

export const CardHeader = (p: {class?: string; children: JSX.Element}) => (
  <header class={clsx(p.class)}>{p.children}</header>
)

export const CardTitle = (p: {class?: string; children: JSX.Element}) => (
  <h2 class={clsx('text-text-strong text-xl font-semibold lg:text-2xl', p.class)}>
    {p.children}
  </h2>
)
