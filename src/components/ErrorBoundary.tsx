import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
  stack?: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { 
      hasError: true, 
      message: String(error?.message || error),
      stack: error?.stack
    };
  }

  componentDidCatch(error: any, info: any) {
    // Log to console so we can see it remotely if needed
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught an error:', error, info);
    console.error('Component stack:', info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2 text-red-500">Something went wrong</h1>
              <p className="text-gray-400 mb-4">The application encountered an unexpected error.</p>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>
            
            {this.state.message && (
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Error Message:</h3>
                <p className="text-sm text-gray-300 font-mono break-all">{this.state.message}</p>
              </div>
            )}
            
            {isDevelopment && this.state.stack && (
              <details className="bg-slate-900 rounded-lg p-4">
                <summary className="text-sm font-semibold text-yellow-400 cursor-pointer mb-2">
                  Stack Trace (Development Mode)
                </summary>
                <pre className="text-xs text-gray-400 overflow-auto max-h-64 mt-2">
                  {this.state.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


