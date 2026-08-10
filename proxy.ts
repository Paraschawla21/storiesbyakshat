import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/forgot-password"];

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isPublicAdminRoute) return NextResponse.next();

  if (isAdminRoute && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
