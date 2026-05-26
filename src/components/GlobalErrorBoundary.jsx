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

export default GlobalErrorBoundary;
