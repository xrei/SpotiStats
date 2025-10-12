import {useNavigate} from '@solidjs/router'

const MainPage = () => {
  const n = useNavigate()

  n('/artists', {replace: true})

  return <div class="flex flex-col h-full"></div>
}

export default MainPage
