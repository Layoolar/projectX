import { NextResponse } from "next/server";
import { COOKIES } from "./app/libs/builder/constants";

export async function middleware(req) {
  const { cookies, nextUrl } = req;

  // GET ACCESS TOKEN FROM COOKIES
  const token = cookies.get(COOKIES.auth_Token)?.value ?? null;

  const ALLOWEDROUTES = ["/", "/auth/twitter"];
  const PUBLICPATHS = ["/images", "/icons", "/temp", "/extras", "/logo.png"];

  const isAllowedRoute = ALLOWEDROUTES.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
  );
  const isPublicPath = PUBLICPATHS.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (!token && !isAllowedRoute && !isPublicPath) {
    const url = new URL("/", req.url);
    url.searchParams.set("next", nextUrl.pathname);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config remains the same
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
