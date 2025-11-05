async function initMocks() {
  if (typeof window === "undefined") {
    console.log("[MSW] Skipping - not in browser environment");
    return;
  }

  // TEMPORARY: Force enable MSW in development since Next.js 16 + Turbopack
  // has issues with NEXT_PUBLIC_ env vars not being exposed to browser
  const isMSWEnabled = process.env.NODE_ENV === "development";

  console.log("[MSW] NODE_ENV:", process.env.NODE_ENV);
  console.log("[MSW] NEXT_PUBLIC_MSW value:", process.env.NEXT_PUBLIC_MSW);
  console.log("[MSW] isMSWEnabled:", isMSWEnabled);

  if (!isMSWEnabled) {
    console.log("[MSW] MSW is disabled (not in development mode)");
    return;
  }

  console.log("[MSW] Initializing MSW...");

  try {
    const { setupWorker } = await import("msw/browser");
    const { handlers } = await import("./handlers");

    console.log("[MSW] Loaded MSW modules successfully");
    console.log("[MSW] Setting up worker with", handlers.length, "handlers");

    const worker = setupWorker(...handlers);
    console.log("[MSW] Worker created successfully");

    // Add timeout to prevent infinite waiting
    const startWithTimeout = Promise.race([
      worker.start({
        onUnhandledRequest: "warn", // Change to warn to see unhandled requests
        quiet: false, // Show MSW logs for debugging
        serviceWorker: {
          url: "/mockServiceWorker.js",
          options: {
            scope: "/",
          },
        },
        waitUntilReady: true,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("MSW start timeout after 5s")), 5000)
      ),
    ]);

    console.log("[MSW] Starting worker...");
    await startWithTimeout;
    console.log("[MSW] MSW initialized successfully");
    console.log("[MSW] Registered handlers:", handlers.length);

    // Log all registered routes for debugging
    handlers.forEach((handler) => {
      console.log("[MSW] Handler registered:", handler.info.method, handler.info.path);
    });

    // Add global request listener to debug
    worker.events.on('request:start', ({ request }) => {
      console.log('[MSW] Outgoing request:', request.method, request.url);
    });

    worker.events.on('request:match', ({ request }) => {
      console.log('[MSW] Request matched:', request.method, request.url);
    });

    worker.events.on('request:unhandled', ({ request }) => {
      console.log('[MSW] Request NOT matched:', request.method, request.url);
    });

    // Verify service worker is actually active
    if (navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log("[MSW] Service worker registrations:", registrations.length);
      registrations.forEach((reg) => {
        console.log("[MSW] SW scope:", reg.scope, "active:", !!reg.active);
      });
    }
  } catch (error) {
    console.error("[MSW] Failed to initialize:", error);
    throw error;
  }
}

export async function enableMSW() {
  if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") {
    await initMocks();
  }
  // Always resolve, even if MSW is not enabled
  return Promise.resolve();
}

