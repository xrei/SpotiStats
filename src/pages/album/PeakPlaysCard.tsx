import {Show, type Accessor} from 'solid-js'
import {dateLib} from '@/shared/lib'
import type {PeakActivity} from './peakActivity'

const tileClasses =
  'flex flex-1 min-w-[200px] flex-col gap-1 rounded-2xl px-5 py-4 whitespace-nowrap shadow-[0_18px_38px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm'

export const PeakPlaysCard = (props: {peak: Accessor<PeakActivity>}) => (
  <Show when={props.peak().month || props.peak().week}>
    <aside class="text-text relative mt-4 w-full max-w-[520px] text-xs md:text-sm lg:mt-0">
      <div class="relative flex flex-col gap-3 overflow-hidden rounded-[32px] bg-transparent px-6 py-5 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-100%,rgba(255,255,255,0.1),transparent_100%)]" />

        <header class="relative flex flex-col gap-1">
          <span class="text-accent absolute top-1 right-1 text-lg leading-none font-semibold">
            ↗
          </span>
          <span class="text-text text-[10px] font-semibold tracking-[0.28em] uppercase">
            Peak plays
          </span>
          <span class="text-text-muted text-[11px]">Your busiest listening windows</span>
        </header>

        <div class="relative flex flex-wrap gap-3 lg:flex-nowrap">
          <Show when={props.peak().month}>
            {(month) => (
              <section
                class={tileClasses}
                style={{
                  background:
                    'linear-gradient(160deg, rgba(255,255,255,0.1), rgba(24,16,30,0.05))',
                }}
              >
                <span class="text-text-muted text-[11px] tracking-wide uppercase">
                  Month
                </span>
                <span class="text-text-strong text-sm font-semibold">
                  {dateLib.formatMonthKey(month().key)}
                </span>
                <span class="text-text-muted text-xs">
                  {month().plays.toLocaleString()} plays
                </span>
              </section>
            )}
          </Show>

          <Show when={props.peak().week}>
            {(week) => (
              <section
                class={tileClasses}
                style={{
                  background:
                    'linear-gradient(160deg, rgba(255,255,255,0.1), rgba(24,16,30,0.05))',
                }}
              >
                <span class="text-text-muted text-[11px] tracking-wide uppercase">
                  Week
                </span>
                <span class="text-text-strong text-sm font-semibold">
                  {dateLib.formatWeekRange(week().start, week().end)}
                </span>
                <span class="text-text-muted text-xs">
                  {week().plays.toLocaleString()} plays
                </span>
              </section>
            )}
          </Show>
        </div>
      </div>
    </aside>
  </Show>
)
