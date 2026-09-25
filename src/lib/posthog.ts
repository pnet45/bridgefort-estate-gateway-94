import posthog from 'posthog-js'

const projectToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN as string | undefined
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined

export const isPostHogConfigured = Boolean(projectToken && apiHost)

if (!projectToken && import.meta.env.DEV) {
  throw new Error('VITE_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_PROJECT_TOKEN is configured')
}

if (!apiHost && import.meta.env.DEV) {
  throw new Error('VITE_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_HOST is configured')
}

if (projectToken && apiHost) {
  posthog.init(projectToken, {
    api_host: apiHost,
    defaults: '2026-01-30',
    capture_exceptions: true,
  })
}

export const captureEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (isPostHogConfigured) posthog.capture(eventName, properties)
}

export const captureException = (error: unknown, properties?: Record<string, unknown>) => {
  if (isPostHogConfigured) posthog.captureException(error, properties)
}

export const identifyUser = (
  userId: string,
  properties?: { email?: string; name?: string; role?: string },
) => {
  if (isPostHogConfigured) posthog.identify(userId, properties)
}

export const resetPostHog = () => {
  if (isPostHogConfigured) posthog.reset()
}

export const getPostHogCorrelationHeaders = () => {
  if (!isPostHogConfigured) return {}

  return {
    'X-POSTHOG-DISTINCT-ID': posthog.get_distinct_id(),
    'X-POSTHOG-SESSION-ID': posthog.get_session_id(),
  }
}

export default posthog
