import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément racine introuvable dans index.html')

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
