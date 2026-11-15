import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

const RECOVERY_STORAGE_KEY = 'bridgefort:ui-error-recovery:v1';
const RECOVERY_WINDOW_MS = 60_000;
const MAX_AUTOMATIC_RELOADS = 2;

interface RecoveryRecord {
  path: string;
  attempts: number;
  startedAt: number;
}

/**
 * Without this, an unhandled render error anywhere in the app unmounts the
 * entire React tree and leaves a blank white screen - no explanation, no way
 * back, nothing. This catches that, explains what happened in plain language,
 * and gives the person concrete next steps instead of a dead page.
 *
 * Wraps <Routes> in App.tsx rather than the whole provider tree, so a crash
 * in one page doesn't tear down routing/auth context along with it - "Go to
 * homepage" and "Try again" both still work.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidMount() {
    if (!this.state.error) this.clearRecoveryRecord();
  }

  componentDidUpdate(_previousProps: ErrorBoundaryProps, previousState: ErrorBoundaryState) {
    if (previousState.error && !this.state.error) this.clearRecoveryRecord();
  }

  componentWillUnmount() {
    if (this.recoveryTimer !== undefined) window.clearTimeout(this.recoveryTimer);
  }

  private recoveryTimer: number | undefined;

  private clearRecoveryRecord = () => {
    try {
      window.sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in private browsing; normal rendering still works.
    }
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, errorInfo);

    // Reload the exact current URL for transient render/chunk failures. The
    // session-scoped attempt limit prevents persistent bugs from looping.
    try {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      const now = Date.now();
      let record: RecoveryRecord | null = null;

      try {
        const stored = window.sessionStorage.getItem(RECOVERY_STORAGE_KEY);
        record = stored ? JSON.parse(stored) as RecoveryRecord : null;
      } catch {
        record = null;
      }

      if (!record || record.path !== currentPath || now - record.startedAt > RECOVERY_WINDOW_MS) {
        record = { path: currentPath, attempts: 0, startedAt: now };
      }

      if (record.attempts < MAX_AUTOMATIC_RELOADS) {
        record.attempts += 1;
        window.sessionStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(record));
        this.recoveryTimer = window.setTimeout(() => window.location.reload(), 250);
      } else {
        console.error('Automatic page recovery limit reached; reload stopped to prevent a loop.');
      }
    } catch (recoveryError) {
      console.error('Automatic page recovery unavailable:', recoveryError);
    }
  }

  handleRetry = () => {
    this.clearRecoveryRecord();
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isDev = import.meta.env.DEV;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Something broke on this page
          </h1>
          <p className="text-slate-600 mb-1">
            This page ran into a problem loading correctly - it's not something you did.
            Your data and account are safe; this is a display issue with this specific page.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Try reloading it below. If it keeps happening, let us know and we'll get it fixed -
            it helps if you mention what you were doing right before this appeared.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={this.handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
              <Home className="h-4 w-4" /> Go to homepage
            </Button>
            <a
              href={`mailto:support@bridgeforthomes.com?subject=${encodeURIComponent(
                'Something broke on the site'
              )}&body=${encodeURIComponent(
                `Page: ${window.location.href}\nWhat I was doing: \nError: ${error.message}`
              )}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Mail className="h-4 w-4" /> Report this
            </a>
          </div>

          {isDev && (
            <details className="mt-8 text-left bg-slate-100 rounded-lg p-4 text-xs text-slate-600 overflow-auto">
              <summary className="cursor-pointer font-medium mb-2">
                Error details (visible in development only)
              </summary>
              <pre className="whitespace-pre-wrap">{error.stack || error.message}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
