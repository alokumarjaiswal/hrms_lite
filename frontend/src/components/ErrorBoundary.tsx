import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('[ ERROR BOUNDARY CAUGHT ]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="container-unibody max-w-2xl">
            <h1 className="text-hierarchy-1 mb-4 text-systemRed">
              [ ERROR: APPLICATION CRASHED ]
            </h1>
            
            <div className="mb-6 font-mono">
              <p className="text-hierarchy-4 mb-2">EXCEPTION:</p>
              <p className="text-hierarchy-3 text-systemRed">
                {this.state.error?.name || 'UnknownError'}
              </p>
            </div>

            <div className="mb-6 font-mono">
              <p className="text-hierarchy-4 mb-2">MESSAGE:</p>
              <p className="text-hierarchy-3">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>

            {this.state.error?.stack && (
              <div className="mb-6">
                <p className="text-hierarchy-4 mb-2">STACK TRACE:</p>
                <pre className="text-hierarchy-5 overflow-auto p-4 bg-systemGray6 border border-border">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="btn-bracket text-systemBlue hover:bg-systemBlue hover:text-background"
            >
              [ RELOAD APPLICATION ]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
