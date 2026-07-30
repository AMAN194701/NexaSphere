import React, { useState, useEffect, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./theme/ThemeProvider";
import { BookmarkProvider } from "./BookmarkContext";
import { SocketProvider } from "./SocketContext";
import { AnalyticsFilterProvider } from "./AnalyticsFilterContext";
import { RoadmapBuilderProvider } from "./RoadmapBuilderContext";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";

interface AppProvidersProps {
  children: React.ReactNode;
}

// Premium loading fallback for hydration and suspense
const FuturisticLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#05050a",
      gap: "24px",
      fontFamily: "'Orbitron', 'Inter', monospace",
      color: "#CC1111",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "64px",
        height: "64px",
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(204, 17, 17, 0.05)",
          boxShadow: "0 0 15px rgba(204, 17, 17, 0.2)",
        }}
      />
      {/* Spinner */}
      <div
        className="loader-spinner"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#CC1111",
          borderRightColor: "rgba(204, 17, 17, 0.3)",
          animation: "spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite",
        }}
      />
    </div>
    <div
      style={{
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "3px",
        textTransform: "uppercase",
        textShadow: "0 0 8px rgba(204, 17, 17, 0.5)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      Initializing NexaSphere
    </div>
    <style>{`
      @keyframes spin { 
        to { transform: rotate(360deg); } 
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
);

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLayoutStable, setIsLayoutStable] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    // Viewport height synchronization to resolve 100vh height jumps on mobile browsers
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Mobile layout stability checks (prevents crashes from sudden orientation/resizing transitions)
    const checkStability = () => {
      updateViewportHeight();
      if (window.innerWidth === 0 || window.innerHeight === 0) {
        setIsLayoutStable(false);
        // Wait and check again when dimensions are populated by browser engine
        setTimeout(checkStability, 50);
      } else {
        setIsLayoutStable(true);
      }
    };

    checkStability();
    window.addEventListener("resize", checkStability);
    window.addEventListener("orientationchange", checkStability);

    // Dynamic runtime diagnostics
    if (import.meta.env.DEV) {
      console.info(
        "[NexaSphere Providers] central architecture layer initialized successfully."
      );
    }

    return () => {
      window.removeEventListener("resize", checkStability);
      window.removeEventListener("orientationchange", checkStability);
    };
  }, []);

  if (!isMounted || !isLayoutStable) {
    return <FuturisticLoader />;
  }

  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <SocketProvider>
            <BookmarkProvider>
              <AnalyticsFilterProvider>
                <RoadmapBuilderProvider>
                  <Suspense fallback={<FuturisticLoader />}>
                    {children}
                  </Suspense>
                </RoadmapBuilderProvider>
              </AnalyticsFilterProvider>
            </BookmarkProvider>
          </SocketProvider>
        </ThemeProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
};
