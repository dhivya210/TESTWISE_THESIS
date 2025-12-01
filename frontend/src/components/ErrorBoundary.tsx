import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fff',
          color: '#000',
          minHeight: '100vh',
          zIndex: 9999,
          position: 'relative'
        }}>
          <h1 style={{ color: '#d32f2f', fontSize: '24px', marginBottom: '20px' }}>⚠️ Something went wrong</h1>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <details style={{ whiteSpace: 'pre-wrap' }} open>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>Error Details (Click to expand/collapse)</summary>
              <div style={{ marginTop: '10px' }}>
                <p><strong>Error:</strong> {this.state.error?.toString()}</p>
                {this.state.error?.stack && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Stack Trace:</strong>
                    <pre style={{ 
                      backgroundColor: '#fff', 
                      padding: '10px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px'
                    }}>{this.state.error.stack}</pre>
                  </div>
                )}
                {this.state.errorInfo?.componentStack && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Component Stack:</strong>
                    <pre style={{ 
                      backgroundColor: '#fff', 
                      padding: '10px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px'
                    }}>{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

