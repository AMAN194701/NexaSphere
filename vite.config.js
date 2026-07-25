import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  resolve: {
    alias: {
      "next/image": "/src/shared/next-image.jsx",
      "next/dynamic": "/src/shared/next-dynamic.jsx",
    },
  },
  // Supports Vercel (/) and GitHub Pages (/NexaSphere/) via env var
  base: process.env.VITE_BASE_PATH || '/',
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'NexaSphere — GL Bajaj Tech Ecosystem',
        short_name: 'NexaSphere',
        description: 'NexaSphere is the premier tech community of GL Bajaj Group of Institutions.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG || "nexasphere",
      project: process.env.SENTRY_PROJECT || "javascript-react",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    VitePWA({
      disable: true,
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "NexaSphere — Connecting GL Bajaj Tech Ecosystem",
        short_name: "NexaSphere",
        description:
          "The premier tech community of GL Bajaj Group of Institutions.",
        theme_color: "#CC1111",
        background_color: "#0A0A0A",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: false,
      "next/image": "/src/shared/next-image.jsx",
      "next/dynamic": "/src/shared/next-dynamic.jsx",
    },
  },
  // Supports Vercel (/) and GitHub Pages (/NexaSphere/) via env var
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    sentryVitePlugin({
      org: process.env.SENTRY_ORG || "nexasphere",
      project: process.env.SENTRY_PROJECT || "javascript-react",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    VitePWA({
      disable: false,
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw-nexasphere.js",
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "offline.html",
      ],
      manifest: {
        id: "/",
        name: "NexaSphere — Connecting GL Bajaj Tech Ecosystem",
        short_name: "NexaSphere",
        description: "The premier tech community of GL Bajaj Group of Institutions — connecting students through hackathons, codathons, workshops, and more.",
        theme_color: "#E63946",
        background_color: "#0A0A0A",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "en",
        categories: ["education", "productivity", "social"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "Open your NexaSphere dashboard",
            url: "/dashboard",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "View Events",
            short_name: "Events",
            description: "Browse upcoming events",
            url: "/events",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
      disable: true,
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "NexaSphere — Connecting GL Bajaj Tech Ecosystem",
        short_name: "NexaSphere",
        description:
          "The premier tech community of GL Bajaj Group of Institutions.",
        theme_color: "#CC1111",
        background_color: "#0A0A0A",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,webp,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globIgnores: [
          "**/nexasphere-logo*",
          "**/logo-full*",
          "**/logo-icon*",
          "**/glbajaj-logo*",
          "**/ayush*",
          "**/tushar*",
          "**/default-project*",
        ],
      },
      devOptions: {
        enabled: false,
        type: "module",
      workbox: {
        inlineWorkboxRuntime: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
      },
    }),
  ],

  define: {
    "process.env": {},
  },

  server: {
    port: 5175,
    proxy: {
      "/api": "http://localhost:8080",
      "/healthz": "http://localhost:8080",
    },
  },
});
  base: './',  // or '/' if deploying to root
})
