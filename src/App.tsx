import { useEffect, useState } from 'react'
import HelpPage from './HelpPage.tsx'
import LoginPage from './LoginPage.tsx'

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash === '#login' ? <LoginPage /> : <HelpPage />
}

export default App
