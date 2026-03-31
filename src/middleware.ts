import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminPage = pathname.startsWith("/admin");
  const isBookPage = pathname.startsWith("/book");

  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isAdminPage && role !== "STAFF") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isBookPage && role !== "CARRIER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
