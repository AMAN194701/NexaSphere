import React from "react";
import ErrorFallback from "./ErrorFallback";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          showGoHome
          onRefresh={() => window.location.reload()}
          onGoHome={() => window.location.assign("/")}
          title="Something went wrong"
          message="We encountered an unexpected issue while loading this content."
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
