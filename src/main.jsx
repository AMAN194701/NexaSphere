import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './i18n';
import { registerSW } from 'virtual:pwa-register';
import { validateEnvironment } from './utils/env';
import { HelmetProvider } from 'react-helmet-async'; // <--- 1. ADD THIS
import { ThemeProvider } from "./context/theme/ThemeProvider";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./i18n";
import { registerSW } from "virtual:pwa-register";
import { initializeSentry } from "./utils/errorTracking.js";
import * as Sentry from "@sentry/react";
import { AppProviders } from "./context/AppProviders";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./context/theme/ThemeProvider";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './i18n';
import { registerSW } from 'virtual:pwa-register';
import { initializeSentry } from './utils/errorTracking.js';
import * as Sentry from '@sentry/react';
import { ThemeProvider } from './context/theme/ThemeProvider';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { initSyncManager } from './utils/syncManager.js';

initializeSentry();

window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason, {
    tags: { type: 'unhandledrejection' },
import { HelmetProvider } from "react-helmet-async";

initializeSentry();

window.addEventListener("unhandledrejection", (event) => {
  Sentry.captureException(event.reason, {
    tags: { type: "unhandledrejection" },
  });
});

window.addEventListener("error", (event) => {
  Sentry.captureException(event.error, { tags: { type: "uncaughterror" } });
});

// Apply saved theme before React renders — prevents flash of wrong theme
const savedTheme = localStorage.getItem('nexasphere-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
const savedTheme = localStorage.getItem("ns-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

// Validate environment configurations
validateEnvironment();
import { HelmetProvider } from 'react-helmet-async';

// Register service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import { ThemeProvider } from "./context/theme/ThemeProvider.tsx";
import { HelmetProvider } from "react-helmet-async";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import { ThemeProvider } from "./context/theme/ThemeProvider.tsx";
// PWA temporarily disabled due to build issues
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <GlobalErrorBoundary>
      <HelmetProvider>
      <App />
      </HelmetProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import { ThemeProvider } from './context/theme/ThemeProvider.tsx';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import { ThemeProvider } from "./context/theme/ThemeProvider.tsx";
import { HelmetProvider } from "react-helmet-async";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import { ThemeProvider } from "./context/theme/ThemeProvider.tsx";
// PWA temporarily disabled due to build issues
import { HelmetProvider } from "react-helmet-async";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./i18n";
import { registerSW } from "virtual:pwa-register";
import { initializeSentry } from "./utils/errorTracking.js";
import * as Sentry from "@sentry/react";

initializeSentry();

window.addEventListener("unhandledrejection", (event) => {
  Sentry.captureException(event.reason, {
    tags: { type: "unhandledrejection" },
  });
_updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New service worker available — notifying UI.');
    window.dispatchEvent(
      new CustomEvent('nexasphere:sw-update', { detail: { updateSW: _updateSW } })
    );
  },

  onOfflineReady() {
    console.log('[PWA] App is ready to work offline.');
    window.dispatchEvent(new CustomEvent('nexasphere:sw-offline-ready'));
  },

  onRegisterError(error) {
    console.error('[PWA] Service worker registration failed:', error);
    Sentry.captureException(error, { tags: { type: 'sw-register-error' } });
  },
});

window.addEventListener("error", (event) => {
  Sentry.captureException(event.error, { tags: { type: "uncaughterror" } });
});

// Apply saved theme before React renders — prevents flash of wrong theme
const savedTheme = localStorage.getItem("ns-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

// Register service worker
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <GlobalErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </GlobalErrorBoundary>
    </HelmetProvider>
createRoot(document.getElementById("root")).render(
  <StrictMode>
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
