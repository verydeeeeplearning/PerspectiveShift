import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ps_user_id";
const PROTECTED_ROUTES = ["/friends", "/chat", "/offline", "/safety/report", "/settings"];
const AUTH_ROUTES = ["/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes: add Cache-Control to prevent browser heuristic caching
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next({
      request: { headers: request.headers },
    });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    return response;
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Check on-spot auth cookie (set by /api/auth/login)
  const userId = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = !!userId;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/matching", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
