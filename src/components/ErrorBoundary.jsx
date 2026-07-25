/**
 * Global Error Boundary Component
 * Catches React errors and logs them to Sentry
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { captureHandledException } from '../utils/errorTracking';

const ErrorBoundaryFallback = ({ error, resetError }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#FFFFFF',
      padding: '20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Background Glow */}
    <div
      style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(204, 17, 17, 0.1) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(204, 17, 17, 0.15)',
          border: '1px solid rgba(204, 17, 17, 0.3)',
          color: '#CC1111',
          fontSize: '28px',
          marginBottom: '24px',
        }}
      >
        ⚠
      </div>

      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '12px',
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '1px',
          background: 'linear-gradient(135deg, #CC1111, #EE2222)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        System Interruption
      </h1>

      <p style={{ fontSize: '1.05rem', color: '#A8A8A8', marginBottom: '28px', lineHeight: '1.6' }}>
        An unexpected error occurred. The NexaSphere core team has been notified, and we are working
        to resolve the issue.
      </p>

      {error && (
        <details
          style={{
            textAlign: 'left',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            maxWidth: '100%',
            marginBottom: '32px',
            fontSize: '0.82rem',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <summary
            style={{ cursor: 'pointer', fontWeight: 'bold', color: '#6B7280', outline: 'none' }}
          >
            Diagnostics & Stack Trace
          </summary>
          <div
            style={{
              marginTop: '12px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              color: '#E5E7EB',
            }}
          >
            <p style={{ fontWeight: 'bold', color: '#CC1111', marginBottom: '8px' }}>
              {error?.toString()}
            </p>
            <p style={{ opacity: 0.8, fontSize: '0.78rem' }}>{error?.stack}</p>
          </div>
        </details>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={resetError}
          style={{
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, #CC1111, #EE2222)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(204, 17, 17, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          Recover Session
        </button>
        <a
          href="/"
          style={{
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#A8A8A8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'transform 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.color = '#A8A8A8';
          }}
        >
          Go Back Home
        </a>
      </div>
    </div>
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    }}
  >
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong</h1>
    <p style={{ fontSize: '1rem', marginBottom: '2rem', maxWidth: '500px', textAlign: 'center' }}>
      We've been notified of the issue and are working to fix it. Please try refreshing the page.
    </p>
    <details
      style={{
        whiteSpace: 'pre-wrap',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '4px',
        maxWidth: '600px',
        marginBottom: '2rem',
        fontSize: '0.85rem',
        fontFamily: 'monospace',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
        Error Details
      </summary>
      <p>{error?.toString()}</p>
      <p>{error?.stack}</p>
    </details>
    <button
      aria-label="Interactive element"
      onClick={resetError}
      style={{
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '1rem',
      }}
    >
      Refresh Page
    </button>
    <a
      aria-label="Interactive element"
      href="/"
      style={{
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      Go Home
    </a>
  </div>
);
import React from "react";
import * as Sentry from "@sentry/react";
import { captureHandledException } from "../utils/errorTracking";
import ErrorFallback from "./common/ErrorFallback";

const ErrorBoundaryFallback = ({ error, resetError }) => {
  const handleRefresh = () => {
    if (typeof resetError === "function") {
      resetError();
      return;
    }
    window.location.reload();
  };

  return (
    <ErrorFallback
      error={error}
      fullPage
      showGoHome
      onRefresh={handleRefresh}
      onGoHome={() => window.location.assign("/")}
      title="Oops! Something went wrong"
      message="We've been notified of the issue and are working to fix it."
    />
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry
    captureHandledException(
      error,
      `React Error Boundary: ${errorInfo.componentStack}`
    );

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    // Optional: reload the page
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Sentry wrapper for better error tracking
export default Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: <ErrorBoundaryFallback />,
  showDialog: false,
});
