import {type JSX, Match, Show, Suspense, Switch} from 'solid-js'
import {A, Navigate, useLocation} from '@solidjs/router'
import {useUnit} from 'effector-solid'
import {historyModel} from '@/features/Magic'
import {
  $isLoadingPersistedData,
  $isInitialized,
  $isSavingToStorage,
} from '@/features/Magic/dataLoader'
import clsx from 'clsx'
import {CogIcon, Loading, SyncIndicator} from '@/shared/ui'

export const AppLayout = (props: {children?: JSX.Element}) => {
  const [artistsInfo, hasData, isLoadingPersisted, isInitialized] = useUnit([
    historyModel.$artistsInfo,
    historyModel.$hasData,
    $isLoadingPersistedData,
    $isInitialized,
  ])
  const loc = useLocation()
  const isMainPage = () => loc.pathname === '/'

  // Show loading while:
  // 1. Not initialized yet (waiting for checkPersistedDataFx to complete)
  // 2. Loading persisted data from IndexedDB
  // 3. Data in memory but not yet aggregated
  const isLoading = () =>
    !isInitialized() ||
    isLoadingPersisted() ||
    (hasData() && artistsInfo().totalArtists === 0)

  // Protected routes: redirect to / only if fully initialized, not loading, and no data
  const needsRedirect = () => isInitialized() && !isLoadingPersisted() && !hasData()

  return (
    <Switch>
      {/* Main page: footer only, no header, handles its own loading/redirect */}
      <Match when={isMainPage()}>
        <div class="bg-bg-page flex h-dvh flex-col">
          <main class="no-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
            {props.children}
          </main>
          <Footer />
        </div>
      </Match>

      {/* Protected routes: redirect to / if no data after initialization */}
      <Match when={needsRedirect()}>
        <Navigate href="/" />
      </Match>

      {/* App shell with header/footer */}
      <Match when={true}>
        <div class="bg-bg-page flex h-dvh flex-col">
          <Header />
          <main class="no-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Suspense fallback={<Loading />}>
              <Show when={!isLoading()} fallback={<Loading />}>
                {props.children}
              </Show>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Match>
    </Switch>
  )
}

const Header = () => {
  const loc = useLocation()
  const isActive = (path: string) => loc.pathname.startsWith(path)
  const [isSaving] = useUnit([$isSavingToStorage])

  return (
    <header class="bg-bg-shell shadow-bg-shell/50 flex items-center gap-6 overflow-visible px-5 py-3 shadow-lg md:overflow-auto">
      <A href="/artists" class="text-text-strong text-lg font-semibold">
        🔮
      </A>
      <nav class="flex items-center gap-2">
        <NavLink href="/artists" active={isActive('/artists')}>
          Artists
        </NavLink>
        <NavLink href="/albums" active={isActive('/albums')}>
          Albums
        </NavLink>
        <NavLink href="/tracks" active={isActive('/tracks')}>
          Tracks
        </NavLink>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <A
          href="/settings"
          class="text-text-muted hover:bg-surface-hover focus-ring rounded-md p-2"
          aria-label="Settings"
        >
          <Show when={isSaving()} fallback={<CogIcon class="size-6" />}>
            <SyncIndicator active={true} />
          </Show>
        </A>
      </div>
    </header>
  )
}

const Footer = () => (
  <footer class="shadow-bg-shell/50 border-t-line/30 border-t shadow-lg">
    <div class="text-text-muted px-10 py-4 text-sm">
      &copy; {new Date().getFullYear()} Rei. Distasteful vibes strictly prohibited.
    </div>
  </footer>
)

function NavLink(props: {href: string; active?: boolean; children: JSX.Element}) {
  const base = clsx(
    'relative inline-flex items-center px-3 py-1.5 text-sm transition-colors ',
    'text-text hover:text-text-strong',
  )

  const underline = clsx(
    'after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0',
    'after:h-0.5 after:w-[70%] after:rounded-full after:bg-accent',
    "after:content-[''] after:transition-transform after:origin-center",
  )
  const underlineInactive = clsx(
    underline,
    'after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100',
  )
  const underlineActive = clsx(underline, 'after:scale-x-100')

  return (
    <A
      href={props.href}
      aria-current={props.active ? 'page' : undefined}
      class={base + ' ' + (props.active ? underlineActive : underlineInactive)}
    >
      {props.children}
    </A>
  )
}
