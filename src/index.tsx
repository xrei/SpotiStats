/* @refresh reload */
import {render} from 'solid-js/web'
import {App} from '@/app/app'
import './shared/styles/index.css'

const root = document.getElementById('root')

render(() => <App />, root!)
