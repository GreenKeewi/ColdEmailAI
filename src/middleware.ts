import { NextResponse } from "next/server";

// Matcher used by Next middleware config.
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// If the publishable key is not present, avoid importing Clerk which throws
// during module initialization. In that case return a passthrough middleware
// so the dev server / static builds won't crash.
let middlewareHandler: any;

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  // Simple passthrough middleware when Clerk is not configured.
  middlewareHandler = (request: Request) => {
    return NextResponse.next();
  };
} else {
  // Only require Clerk when the publishable key is set. Use require to keep
  // the import dynamic and avoid evaluation when the env is missing.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/track(.*)",
    "/privacy",
    "/terms",
  ]);

  middlewareHandler = clerkMiddleware((auth: any, request: Request) => {
    if (!isPublicRoute(request)) {
      auth().protect();
    }
  });
}

export default middlewareHandler;

// Wrap the exported handler with a dev-only header-normalization wrapper
// to handle forwarded-host / origin mismatches in remote dev environments
// (e.g., GitHub Codespaces / GitHub.dev). This recreates the incoming
// Request with a corrected `origin` header when a mismatch is detected,
// then calls the original handler.
if (process.env.NODE_ENV !== "production") {
  const original = middlewareHandler;
  middlewareHandler = async (request: any, ...rest: any[]) => {
    try {
      const xfHost = request.headers.get("x-forwarded-host");
      const origin = request.headers.get("origin") || request.headers.get("host");

      if (xfHost && origin && xfHost !== origin) {
        // Prefer https for forwarded hosts (common in cloud dev URLs).
        const normalizedOrigin = xfHost.startsWith("http") ? xfHost : `https://${xfHost}`;

        const newHeaders = new Headers(request.headers);
        newHeaders.set("origin", normalizedOrigin);

        // Recreate the request body if present.
        let body: any = undefined;
        try {
          // request.text() may only be used once; catch if unsupported.
          body = await request.text();
        } catch (e) {
          body = undefined;
        }

        const newReq = new Request(request.url, {
          method: request.method,
          headers: newHeaders,
          body: body && body.length ? body : undefined,
        });

        return await original(newReq, ...rest);
      }
    } catch (e) {
      // If anything goes wrong, fall back to original request so dev doesn't break.
      // eslint-disable-next-line no-console
      console.warn("Middleware header normalization failed:", e);
    }

    return await original(request, ...rest);
  };
}
