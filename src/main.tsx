import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { PostHogErrorBoundary, PostHogProvider } from '@posthog/react'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import posthog, { isPostHogConfigured } from './lib/posthog'
import './index.css'

const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary recoveryScope="root">
      {isPostHogConfigured ? (
        <PostHogProvider client={posthog}>
          <PostHogErrorBoundary>{app}</PostHogErrorBoundary>
        </PostHogProvider>
      ) : app}
    </ErrorBoundary>
  </React.StrictMode>,
)
