import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from 'sonner'
import useRouteElements from './useRouteElements'
import { useAppContext } from './components/AppProvider'
import { useEffect } from 'react'
import { LocalStorageEventTarget } from './lib/utils'

function App() {
  const { reset } = useAppContext()
  const routeElements = useRouteElements()

  useEffect(() => {
    LocalStorageEventTarget.addEventListener('clearLocalStorage', reset)
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLocalStorage', reset)
    }
  }, [reset])

  return (
    <ThemeProvider>
      {routeElements}
      <Toaster closeButton />
    </ThemeProvider>
  )
}

export default App
