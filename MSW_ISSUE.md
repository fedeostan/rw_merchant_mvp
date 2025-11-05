# MSW Not Intercepting Axios Requests in Next.js 16 (App Router)

## Environment

- **Next.js**: 16.0.1 (Turbopack)
- **MSW**: Latest (browser with setupWorker)
- **Axios**: Latest
- **React**: 19.2.0
- **Framework**: Next.js App Router (client components)

## Problem Description

MSW handlers are not intercepting axios requests despite:
1. ✅ Service worker is registered and active
2. ✅ MSW is initialized before app renders (via Providers)
3. ✅ Handlers are registered with wildcard patterns
4. ✅ Axios is using absolute baseURL

### Current Configuration

**Axios Configuration** (`src/lib/api/fetcher.ts`):
```typescript
const getBaseURL = (): string => {
  // For browser environments, use absolute URL for MSW compatibility
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
};

// Results in: baseURL: "http://localhost:3000/api"
```

**MSW Handlers** (`src/lib/msw/handlers.ts`):
```typescript
export const handlers = [
  http.get("*/api/mnee/price", () => {
    console.log("[MSW] Handling: GET /api/mnee/price");
    return HttpResponse.json({
      price: 1.10,
      currency: "USD",
      change24h: 2.5,
      lastUpdated: new Date().toISOString(),
    });
  }),

  http.get(`*/api/orgs/${MOCK_ORG_ID}/storefronts/:sfId/balance`, () => {
    console.log(`[MSW] Handling: GET /api/orgs/${MOCK_ORG_ID}/storefronts/:sfId/balance`);
    const balance: MoneyBalance = {
      storefrontId: "sf_1",
      currency: "MNEE",
      available: 24567.0,
      pending: 0.0,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(balance);
  }),
  // ... more handlers
];
```

**MSW Initialization** (`src/lib/msw/browser.ts`):
```typescript
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

  await worker.start({
    onUnhandledRequest: "warn",
    quiet: false,
    serviceWorker: {
      url: "/mockServiceWorker.js",
      options: {
        scope: "/",
      },
    },
    waitUntilReady: true,
  });

  console.log("[MSW] MSW initialized successfully");
  console.log("[MSW] Registered handlers:", handlers.length);
}

export async function enableMSW() {
  if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") {
    await initMocks();
  }
  return Promise.resolve();
}
```

**App Providers** (`src/app/providers.tsx`):
```typescript
export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const isMSWEnabled = process.env.NEXT_PUBLIC_MSW === "true";

    if (!isMSWEnabled) {
      setMswReady(true);
      return;
    }

    enableMSW()
      .then(() => {
        setMswReady(true);
      })
      .catch((error) => {
        console.error("[Providers] MSW initialization failed:", error);
        setMswReady(true);
      });
  }, []);

  const isMSWEnabled = process.env.NEXT_PUBLIC_MSW === "true";
  const shouldWait = isMSWEnabled && (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview");

  if (!mswReady && shouldWait) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

## Error Details

### Request 1: Balance Endpoint
```
URL: /orgs/org_1/storefronts/sf_1/balance
baseURL: http://localhost:3000/api
Full URL: http://localhost:3000/api/orgs/org_1/storefronts/sf_1/balance
Status: 404
```

**Expected Handler Match**: `*/api/orgs/org_1/storefronts/:sfId/balance`

### Request 2: Price Endpoint
```
URL: /mnee/price
baseURL: http://localhost:3000/api
Full URL: http://localhost:3000/api/mnee/price
Status: 404
```

**Expected Handler Match**: `*/api/mnee/price`

## What We've Tried

1. ✅ Using wildcard patterns `*/api/...` in handlers
2. ✅ Using absolute baseURL in axios: `http://localhost:3000/api`
3. ✅ Ensuring service worker is registered before app renders
4. ✅ Verified `mockServiceWorker.js` exists in `/public/`
5. ✅ Set `NEXT_PUBLIC_MSW=true` in `.env.local`
6. ✅ Used `setupWorker` (not `setupServer`)
7. ✅ Set `onUnhandledRequest: "warn"` to see unhandled requests
8. ✅ Set `quiet: false` to enable MSW logs

## Questions

1. **Are wildcard patterns like `*/api/...` supported in MSW browser workers?**
2. **Does MSW work with Next.js 16 App Router + Turbopack?**
3. **Is there a known issue with MSW intercepting axios requests in Next.js?**
4. **Should we be using a different URL pattern for handlers?**

## Expected Behavior

When axios makes a request to `http://localhost:3000/api/mnee/price`:
1. MSW service worker should intercept it
2. Handler should match the pattern `*/api/mnee/price`
3. Console should show: `[MSW] Handling: GET /api/mnee/price`
4. Mock response should be returned

## Actual Behavior

1. Request is NOT intercepted by MSW
2. Request hits Next.js routing
3. Next.js returns 404 (no matching route)
4. No MSW handler logs appear in console

## Related Issues

- https://github.com/mswjs/msw/issues/1803 (Node.js/Jest environment)
- https://github.com/mswjs/msw/issues/1698 (Next.js page refresh)
- https://github.com/mswjs/msw/issues/397 (baseURL support request)

## Additional Context

We're using MSW to mock API calls during development since we don't have a backend yet. The service worker is properly registered, handlers are registered, and the app waits for MSW to initialize before rendering. However, no requests are being intercepted.

Any guidance would be greatly appreciated!
