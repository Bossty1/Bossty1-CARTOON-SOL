import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/delicious-handrawn/latin-400.css'
import '@fontsource/knewave/latin-400.css'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-400-italic.css'
import '@fontsource/nunito/latin-700.css'

import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'
import './styles/components.css'
import './styles/creator.css'

import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
