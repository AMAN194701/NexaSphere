import React from "react";
import ErrorFallback from "./common/ErrorFallback";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log errors using console.error as required
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          fullPage
          showGoHome
          onRefresh={() => window.location.reload()}
          onGoHome={() => window.location.assign("/")}
          title="Something went wrong"
          message="An unexpected error occurred. Please refresh the page or return to home."
        />
      );
    }

    return this.props.children;
  }
}
const FallbackUI = () => {
  return (
    <div className="global-error-boundary" role="alert">
      <div className="global-error-content">
        <h1>Something went wrong. Please reload the page.</h1>
        <button
          onClick={() => window.location.reload()}
          aria-label="Reload the page"
          className="retry-button"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

const GlobalErrorBoundary = ({ children }) => {
  return <Sentry.ErrorBoundary fallback={FallbackUI}>{children}</Sentry.ErrorBoundary>;
};

export default GlobalErrorBoundary;
