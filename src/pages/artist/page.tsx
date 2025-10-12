import clsx from 'clsx'
import {Show, createSignal, onCleanup, onMount} from 'solid-js'
import {useGate, useUnit} from 'effector-solid'
import {useParams} from '@solidjs/router'
import * as artistModel from './model'
import {TracksSection} from './TracksSection'
import {AlbumSection} from './AlbumSection'

const HEADER_TRIGGER_OFFSET = 64

const MiniHeaderBar = (props: {name: string; visible: () => boolean}) => {
  const stats = useUnit(artistModel.$totalStats)

  return (
    <div class="sticky top-0 z-50" style={{height: '0px', overflow: 'visible'}}>
      <div
        class="bg-surface-1 absolute inset-x-0 top-0 flex items-center transition-opacity duration-200"
        style={{
          opacity: props.visible() ? 1 : 0,
          ['pointer-events']: props.visible() ? 'auto' : 'none',
          height: '60px',
        }}
      >
        <div class="flex w-full items-center justify-between px-6 text-sm font-medium">
          <span class="text-text-strong text-xl">{props.name}</span>
          <span class="text-text">
            {stats().plays} plays <span class="text-text-muted">•</span> {stats().hours}
          </span>
        </div>
      </div>
    </div>
  )
}

const HeroSection = (props: {name: string}) => {
  const stats = useUnit(artistModel.$totalStats)

  return (
    <section class="relative z-0 pb-6">
      <div
        class={clsx(
          'absolute inset-0 -z-10',
          'to-accent/60 from-surface-1/5 bg-linear-to-t mix-blend-darken backdrop-blur-sm',
        )}
      />

      <div class="flex min-h-[300px] flex-col justify-end gap-4 px-6 pb-16">
        <div>
          <h1 class="text-text-strong text-4xl font-bold md:text-5xl">{props.name}</h1>
          <p class="mt-2 pl-1 text-lg md:mt-4 md:text-xl">
            {stats().plays} plays • {stats().hours}
          </p>
        </div>
      </div>
    </section>
  )
}

const createIntersectionObserver = (
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit,
) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  return new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry) onIntersect(entry)
  }, options)
}

const ArtistPage = () => {
  const params = useParams<{artist: string}>()
  useGate(artistModel.ArtistPageGate, {artist: decodeURIComponent(params.artist)})

  const artist = useUnit(artistModel.$artistData)
  const tracks = useUnit(artistModel.$popularTracks)
  const albums = useUnit(artistModel.$albums)

  const [headerVisible, setHeaderVisible] = createSignal(false)

  let scroller: HTMLDivElement | undefined
  let tracksSentinel: HTMLDivElement | undefined

  onMount(() => {
    let observer: IntersectionObserver | undefined
    let frameId: number | undefined

    const attachObserver = () => {
      if (!scroller || !tracksSentinel) {
        frameId = requestAnimationFrame(attachObserver)
        return
      }

      observer = createIntersectionObserver(
        (entry) => setHeaderVisible(!entry.isIntersecting),
        {
          root: scroller,
          rootMargin: `-${HEADER_TRIGGER_OFFSET}px 0px 0px 0px`,
          threshold: 0,
        },
      )

      if (!observer) return

      observer.observe(tracksSentinel)
    }

    attachObserver()

    onCleanup(() => {
      if (frameId !== undefined) cancelAnimationFrame(frameId)
      observer?.disconnect()
    })
  })

  return (
    <div class="relative z-0 m-2 flex h-full min-h-0 flex-col">
      <Show
        when={artist()}
        fallback={
          <div class="flex h-full items-center justify-center text-lg">
            Artist not found
          </div>
        }
      >
        <div class="relative flex-1 overflow-hidden rounded-xl">
          <MiniHeaderBar name={artist()!.name} visible={headerVisible} />
          <div
            ref={(el) => (scroller = el)}
            class="bg-surface-1/50 relative h-full overflow-y-auto will-change-scroll"
            style={{
              'scrollbar-gutter': 'stable',
            }}
          >
            <HeroSection name={artist()!.name} />

            <div
              ref={(el) => (tracksSentinel = el)}
              aria-hidden="true"
              class="h-0 w-full"
            />

            <div class="relative z-10 flex flex-1 flex-col px-6 pt-6 pb-12">
              <TracksSection tracks={tracks} />
              <div class="mt-14">
                <AlbumSection albums={albums} />
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default ArtistPage
