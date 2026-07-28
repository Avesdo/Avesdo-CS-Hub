import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
    
    // Automatically reload the page once if a dynamic import fails (usually means a new version was deployed)
    if (error.message && (error.message.includes('Failed to fetch dynamically imported module') || error.message.includes('Importing a module script failed'))) {
      const lastReload = sessionStorage.getItem('chunk_load_error_time');
      const now = Date.now();
      // Only reload if we haven't already reloaded in the last 10 seconds (prevents infinite loops)
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('chunk_load_error_time', now.toString());
        // Force cache bypass by appending a timestamp query param
        const url = new URL(window.location.href);
        url.searchParams.set('v', now.toString());
        window.location.href = url.toString();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-xl border border-red-100">
          <AlertOctagon className="w-12 h-12 text-red-500 mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600/80 max-w-md">
            A component failed to render properly. Try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
