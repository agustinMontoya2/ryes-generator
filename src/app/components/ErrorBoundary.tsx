import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Algo salio mal</h1>
            <p className="text-gray-600 mb-4">
              Ocurrio un error inesperado. Podes intentar recargar la pagina.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-600 bg-red-50 p-3 rounded mb-4 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={() => window.location.reload()}>Recargar pagina</Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
