import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password", "/api/auth", "/help"];
const STATIC_PREFIXES = ["/_next", "/favicon.ico", "/Athena.png", "/DreamForgeConsultingLogo.png"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and public files
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow API routes (auth checked at handler level where needed)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for session cookie (HTTPS uses __Secure- prefix)
  const sessionToken =
    req.cookies.get("__Secure-better-auth.session_token")?.value ??
    req.cookies.get("better-auth.session_token")?.value;

  // Landing page is public — but redirect logged-in users to their dashboard
  if (pathname === "/") {
    if (!sessionToken) return NextResponse.next();
    // Has session — check role and redirect
    try {
      const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
        headers: { cookie: req.headers.get("cookie") ?? "" },
      });
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        const role = session?.user?.role;
        if (role === "CLIENT") return NextResponse.redirect(new URL("/portal", req.url));
        if (role) return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch { /* fall through to landing page */ }
    return NextResponse.next();
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Validate session and get user role via better-auth API
  try {
    const sessionRes = await fetch(
      `${req.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
      }
    );

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const session = await sessionRes.json();
    const role = session?.user?.role;

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // CLIENT role can only access /portal/*
    if (role === "CLIENT" && !pathname.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
