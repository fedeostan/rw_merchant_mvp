"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client";
import { enableMSW } from "@/lib/msw/browser";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // TEMPORARY: Force enable MSW in development since Next.js 16 + Turbopack
    // has issues with NEXT_PUBLIC_ env vars not being exposed to browser
    const isMSWEnabled = process.env.NODE_ENV === "development";

    console.log("[Providers] NODE_ENV:", process.env.NODE_ENV);
    console.log("[Providers] NEXT_PUBLIC_MSW:", process.env.NEXT_PUBLIC_MSW);
    console.log("[Providers] isMSWEnabled:", isMSWEnabled);

    if (!isMSWEnabled) {
      // If MSW is not enabled, render immediately
      console.log("[Providers] MSW disabled, rendering immediately");
      setMswReady(true);
      return;
    }

    // Only wait for MSW initialization if it's enabled
    console.log("[Providers] Waiting for MSW initialization...");
    enableMSW()
      .then(() => {
        console.log("[Providers] MSW ready, rendering app");
        setMswReady(true);
      })
      .catch((error) => {
        // If MSW fails to initialize, still render the app
        console.error("[Providers] MSW initialization failed:", error);
        console.log("[Providers] Rendering app anyway");
        setMswReady(true);
      });
  }, []);

  // Only wait for MSW if it's enabled and we're in development/preview
  const isMSWEnabled = process.env.NODE_ENV === "development";
  const shouldWait = isMSWEnabled;

  if (!mswReady && shouldWait) {
    console.log("[Providers] Waiting for MSW... (mswReady:", mswReady, "shouldWait:", shouldWait, ")");
    return null;
  }

  console.log("[Providers] Rendering children (mswReady:", mswReady, "shouldWait:", shouldWait, ")");

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

