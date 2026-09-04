import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/*
  Self-hosted through fontsource, whose @font-face rules already declare
  font-display: swap. Imported before index.css so the faces are registered by
  the time the theme names them.
*/
import '@fontsource-variable/public-sans'
import '@fontsource-variable/source-serif-4'

import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
