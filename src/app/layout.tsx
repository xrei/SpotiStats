import {type JSX, Show} from 'solid-js'
import {A, useLocation, useNavigate} from '@solidjs/router'
import {useUnit} from 'effector-solid'
import {historyModel} from '@/features/Magic'
import {clearData} from '@/features/Magic/dataLoader'
import clsx from 'clsx'
import {CogIcon} from '@/shared/ui'

export const AppLayout = (props: {children?: JSX.Element}) => {
  const artistsInfo = useUnit(historyModel.$artistsInfo)
  const loc = useLocation()
  const isMainPage = () => loc.pathname === '/'

  return (
    <div class="bg-bg-page flex h-dvh min-h-dvh flex-col overflow-hidden">
      <Show when={!isMainPage()}>
        <Header />
      </Show>
      <main class="no-scroll flex min-h-0 flex-1 flex-col">
        {/* px-4 py-4 md:px-5 xl:px-10 */}
        <Show
          when={artistsInfo().totalArtists > 0 || isMainPage()}
          fallback={
            <div class="flex flex-1 items-center justify-center text-3xl">Loading...</div>
          }
        >
          {props.children}
        </Show>
      </main>
      <footer class="shadow-bg-shell/50 border-t-line/30 border-t shadow-lg">
        <div class="text-text-muted px-10 py-4 text-sm">
          &copy; {new Date().getFullYear()} Rei. Distasteful vibes strictly prohibited.
        </div>
      </footer>
    </div>
  )
}

const Header = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const isActive = (path: string) => loc.pathname.startsWith(path)

  const handleClearData = () => {
    if (confirm('Clear all uploaded data? You will need to re-upload your files.')) {
      clearData()
      navigate('/', {replace: true})
    }
  }

  return (
    <header class="bg-bg-shell shadow-bg-shell/50 flex items-center gap-6 overflow-hidden px-5 py-3 shadow-lg md:overflow-auto">
      <A href="/artists" class="text-text-strong text-lg font-semibold">
        🔮
      </A>
      {/* Spotistats */}
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

      <button
        type="button"
        onClick={handleClearData}
        class="text-text-muted hover:bg-surface-hover focus-ring ml-auto rounded-md px-3 py-1.5 text-sm transition-colors"
        title="Clear uploaded data"
      >
        Clear Data
      </button>

      <button
        type="button"
        class="text-text-muted hover:bg-surface-hover focus-ring rounded-md p-2"
        aria-label="Settings"
      >
        <CogIcon class="size-5" />
      </button>
    </header>
  )
}

function NavLink(props: {href: string; active?: boolean; children: JSX.Element}) {
  const base = clsx(
    'relative inline-flex items-center px-3 py-1.5 text-sm transition-colors ',
    'text-text hover:text-text-strong',
  )

  const underline = clsx(
    'after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0',
    'after:h-[2px] after:w-[70%] after:rounded-full after:bg-accent',
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
