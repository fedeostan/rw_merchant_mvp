async function initMocks() {
  if (typeof window === "undefined") {
    return;
  }

  const isMSWEnabled = process.env.NEXT_PUBLIC_MSW === "true";

  if (!isMSWEnabled) {
    console.log("[MSW] MSW is disabled (NEXT_PUBLIC_MSW != 'true')");
    return;
  }

  console.log("[MSW] Initializing MSW...");

  const { setupWorker } = await import("msw/browser");
  const { handlers } = await import("./handlers");

  const worker = setupWorker(...handlers);

  // Add timeout to prevent infinite waiting
  const startWithTimeout = Promise.race([
    worker.start({
      onUnhandledRequest: "bypass",
      quiet: false, // Show MSW logs for debugging
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MSW start timeout after 5s")), 5000)
    ),
  ]);

  await startWithTimeout;
  console.log("[MSW] MSW initialized successfully");
}

export async function enableMSW() {
  if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") {
    await initMocks();
  }
  // Always resolve, even if MSW is not enabled
  return Promise.resolve();
}

