import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyPalette, getPalette } from './lib/palette'
import { pruneCache } from './lib/pageCache'

applyPalette(getPalette())
pruneCache()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
