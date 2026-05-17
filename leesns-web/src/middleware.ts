import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAuthSuccessPage = pathname.startsWith("/auth/success");

  if (!isAuthPage && !isAuthSuccessPage && !hasAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
