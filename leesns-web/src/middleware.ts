import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.cookies.has("accessToken")) {
    return NextResponse.redirect(new URL("/login", request.url));
  } else return NextResponse.next();
}

export const config = {
  // api, Next.js 내부 자원, 이미지, 파비콘, 그리고 login과 signup을 '제외한' 모든 경로
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)"],
};
