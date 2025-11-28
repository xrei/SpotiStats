import {type RouteDefinition} from '@solidjs/router'
import MainPage from './main/page'
import ArtistsPage from './artists/page'
import ArtistPage from './artist/page'
import AlbumPage from './album/page'
import AlbumsPage from './albums/page'
import TracksPage from './tracks/page'
import SettingsPage from './settings/page'
import NotFoundPage from './404/page'

export const routes: RouteDefinition[] = [
  {path: '/', component: MainPage},
  {path: '/artists', component: ArtistsPage},
  {path: '/artists/:artist', component: ArtistPage},
  {path: '/artists/:artist/:album', component: AlbumPage},
  {path: '/albums', component: AlbumsPage},
  {path: '/tracks', component: TracksPage},
  {path: '/settings', component: SettingsPage},
  {path: '*', component: NotFoundPage},
]
