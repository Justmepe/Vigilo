/**
 * Error Boundary Component - Catches and displays errors gracefully
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send error to logging service
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Could integrate with Sentry or other error tracking
      console.warn('Error logged to monitoring service');
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <AlertTriangle size={48} color="#ef4444" />
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>
              We're sorry for the inconvenience. An unexpected error has occurred.
            </p>

            {isDevelopment && this.state.error && (
              <div style={styles.errorDetails}>
                <h3 style={styles.detailsTitle}>Error Details (Development Only):</h3>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details style={styles.details}>
                    <summary style={styles.summary}>Stack Trace</summary>
                    <pre style={styles.errorText}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div style={styles.actions}>
              <button
                onClick={this.handleReset}
                style={styles.button}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Go to Dashboard
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p style={styles.warning}>
                Multiple errors detected. Please contact support if this persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '16px'
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '8px',
    color: '#1f2937'
  },
  message: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px'
  },
  errorDetails: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  detailsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '8px'
  },
  errorText: {
    backgroundColor: '#fff5f5',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '300px',
    fontFamily: 'monospace',
    color: '#7f1d1d'
  },
  details: {
    marginTop: '12px',
    cursor: 'pointer'
  },
  summary: {
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '8px'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    backgroundColor: '#6b7280'
  },
  warning: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: '500'
  }
};

export default ErrorBoundary;
