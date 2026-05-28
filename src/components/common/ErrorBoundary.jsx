import React from "react";
import { DynamicIcon } from "../../shared/Icons";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDiagnostics: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      "[Component ErrorBoundary] caught an error:",
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      const isExcessive = this.state.retryCount >= 3;
      return (
        <div
          style={{
            minHeight: "260px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            background: "rgba(15, 15, 25, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 68, 68, 0.25)",
            boxShadow: "0 8px 32px 0 rgba(255, 68, 68, 0.1)",
            margin: "16px",
            fontFamily: "'Inter', sans-serif",
            color: "var(--t1, #ffffff)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle neon red glow */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle, rgba(255, 68, 68, 0.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              color: "#ff4444",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <DynamicIcon name="AlertTriangle" size={40} />
          </div>

          <h3
            style={{
              fontFamily: "'Orbitron', 'Inter', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
              color: "#ff4444",
              marginBottom: "8px",
            }}
          >
            Component Failed to Load
          </h3>

          <p
            style={{
              color: "var(--t2, #a0aec0)",
              fontSize: "0.85rem",
              maxWidth: "360px",
              lineHeight: 1.5,
              marginBottom: "20px",
            }}
          >
            {isExcessive
              ? "This component keeps failing. Please try refreshing the entire page or contact support."
              : "A component-level runtime exception occurred. We isolated the crash to keep the rest of the application active."}
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {!isExcessive ? (
              <button
                onClick={this.handleRetry}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "#ff4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(255, 68, 68, 0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <DynamicIcon name="RefreshCw" size={14} /> Retry Component
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "#ff4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(255, 68, 68, 0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <DynamicIcon name="RefreshCw" size={14} /> Reload Page
              </button>
            )}

            <button
              onClick={() =>
                this.setState((prev) => ({
                  showDiagnostics: !prev.showDiagnostics,
                }))
              }
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "0.85rem",
                fontWeight: 600,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "var(--t1, #fff)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <DynamicIcon name="Eye" size={14} />{" "}
              {this.state.showDiagnostics ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {this.state.showDiagnostics && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "8px",
                width: "100%",
                textAlign: "left",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                overflowX: "auto",
                maxHeight: "120px",
              }}
            >
              <strong style={{ color: "#ff4444" }}>
                {this.state.error?.name}:{" "}
              </strong>
              <span>{this.state.error?.message}</span>
              {this.state.errorInfo?.componentStack && (
                <pre
                  style={{
                    margin: "8px 0 0 0",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {this.state.errorInfo.componentStack
                    .split("\n")
                    .slice(0, 4)
                    .join("\n")}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
