import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error', { error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600">{this.state.errorMessage}</p>

          <Button className="mt-6" onClick={this.handleReload}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
}
