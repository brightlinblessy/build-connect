import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import ConfigErrorScreen from './ConfigErrorScreen.jsx'

// Checked here, before AppRoot (and therefore before any Firebase
// import) is loaded, so a missing config can never crash the app
// with a blank white screen — see ConfigErrorScreen.jsx for why.
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missing = REQUIRED_ENV_VARS.filter((key) => !import.meta.env[key])
const root = ReactDOM.createRoot(document.getElementById('root'))

if (missing.length > 0) {
  root.render(
    <React.StrictMode>
      <ConfigErrorScreen missing={missing} />
    </React.StrictMode>,
  )
} else {
  import('./AppRoot.jsx').then(({ default: AppRoot }) => {
    root.render(<AppRoot />)
  })
}
