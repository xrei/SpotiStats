import {type RouteDefinition} from '@solidjs/router'
import {lazy} from 'solid-js'

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./main/page')),
  },
  {
    path: '/artists',
    component: lazy(() => import('./artists/page')),
  },
  {
    path: '/artists/:artist',
    component: lazy(() => import('./artist/page')),
  },
  {
    path: '/artists/:artist/:album',
    component: lazy(() => import('./album/page')),
  },
  {
    path: '/albums',
    component: lazy(() => import('./albums/page')),
  },
  {
    path: '/tracks',
    component: lazy(() => import('./tracks/page')),
  },

  {
    path: '*',
    component: lazy(() => import('./404/page')),
  },
]
