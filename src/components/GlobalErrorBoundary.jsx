import React from "react";
import * as Sentry from "@sentry/react";
import "./GlobalErrorBoundary.css";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDiagnostics: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Report to Sentry if initialized
    try {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo?.componentStack,
        },
      });
    } catch (e) {
      console.error("Failed to report error to Sentry:", e);
    }
  }

  handleSoftReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    // Preserve authentication sessions
    const authKeys = ["token", "authToken", "ns-token", "user", "session"];
    const preserved = {};

    authKeys.forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) preserved[key] = val;
    });

    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Restore preserved session tokens
    Object.keys(preserved).forEach((key) => {
      localStorage.setItem(key, preserved[key]);
    });

    // Soft reload to apply clean state
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleDownloadDiagnostics = () => {
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      error: {
        name: this.state.error?.name,
        message: this.state.error?.message,
        stack: this.state.error?.stack,
      },
      componentStack: this.state.errorInfo?.componentStack,
      storageStatus: {
        localStorageLength: localStorage.length,
        sessionStorageLength: sessionStorage.length,
      },
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(diagnosticReport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `nexasphere-error-report-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="global-error-container" role="alert">
          <div className="error-backdrop-orbs">
            <div className="error-orb error-orb-1"></div>
            <div className="error-orb error-orb-2"></div>
          </div>

          <div className="global-error-card">
            <div className="error-card-header">
              <div className="error-icon-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h1 className="error-title">System Error Detected</h1>
              <p className="error-subtitle">
                NexaSphere encountered a runtime exception and recovered safely.
              </p>
            </div>

            <div className="error-actions-grid">
              <button
                onClick={this.handleRetry}
                className="error-btn error-btn-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 4v6h-6"></path>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Retry Render
              </button>
              <button
                onClick={this.handleSoftReload}
                className="error-btn error-btn-secondary"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
                Soft Reload
              </button>
              <button
                onClick={this.handleResetState}
                className="error-btn error-btn-warning"
                title="Resets stored states while keeping your login session active"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Reset App Cache
              </button>
              <button
                onClick={this.handleDownloadDiagnostics}
                className="error-btn error-btn-info"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Report Report
              </button>
            </div>

            <div className="diagnostics-toggle-container">
              <button
                onClick={() =>
                  this.setState((prev) => ({
                    showDiagnostics: !prev.showDiagnostics,
                  }))
                }
                className="diagnostics-toggle-btn"
              >
                {this.state.showDiagnostics
                  ? "Hide Diagnostics"
                  : "Show Advanced Diagnostics"}
                <svg
                  className={this.state.showDiagnostics ? "rotate-180" : ""}
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            {this.state.showDiagnostics && (
              <div className="diagnostics-panel animate-slide-down">
                <div className="diagnostic-item">
                  <span className="diagnostic-label">Error Details:</span>
                  <div className="diagnostic-value error-message">
                    {this.state.error?.name}: {this.state.error?.message}
                  </div>
                </div>

                {this.state.error?.stack && (
                  <div className="diagnostic-item">
                    <span className="diagnostic-label">Stack Trace:</span>
                    <pre className="diagnostic-stack-trace">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div className="diagnostic-item">
                    <span className="diagnostic-label">
                      Component Hierarchy:
                    </span>
                    <pre className="diagnostic-stack-trace">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                <div className="diagnostic-metadata-grid">
                  <div>
                    <strong>URL:</strong> {window.location.pathname}
                  </div>
                  <div>
                    <strong>Time:</strong> {new Date().toLocaleTimeString()}
                  </div>
                  <div>
                    <strong>Resolution:</strong> {window.innerWidth}x
                    {window.innerHeight}
                  </div>
                  <div>
                    <strong>OS/Platform:</strong> {navigator.platform}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
