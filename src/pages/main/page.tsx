import {useNavigate} from '@solidjs/router'

const MainPage = () => {
  const n = useNavigate()

  n('/artists', {replace: true})

  return <div class="flex h-full flex-col"></div>
}

export default MainPage
