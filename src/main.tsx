import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import AppProvider from './components/AppProvider.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import PathRecorder from './components/PathRecorder.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppProvider>
      <PathRecorder />
    </BrowserRouter>
  </StrictMode>
)
