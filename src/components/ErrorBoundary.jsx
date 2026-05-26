/**
 * Global Error Boundary Component
 * Catches React errors and logs them to Sentry
 */

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
    if (import.meta.env.DEV) {
      console.error("Error caught by boundary:", error, errorInfo);
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
