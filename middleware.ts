import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Stamps the requested pathname onto a request header so Server Components
 * (which don't otherwise know the current path) can read it via headers().
 * Used by the root layout to decide whether a route should bypass
 * maintenance mode (e.g. /login, /developer, /api) without needing a
 * database call inside middleware itself.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
