import React from "react";
import ThemeProvider from "../src/components/ThemeProvider";

export const metadata = {
  title: "NexaSphere — Connecting GL Bajaj Tech Ecosystem",
  description:
    "NexaSphere is the premier tech community of GL Bajaj Group of Institutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
