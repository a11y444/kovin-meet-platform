import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false
  
  const pathname = nextUrl.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/events",
    "/meeting/join",
  ]
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // API routes that don't require authentication
  const publicApiRoutes = [
    "/api/auth",
    "/api/public",
  ]
  
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route))
  
  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next()
  }
  
  // Public API routes
  if (isPublicApi) {
    return NextResponse.next()
  }
  
  // Super admin routes - require super admin access
  if (pathname.startsWith("/superadmin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/superadmin", nextUrl))
    }
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }
    return NextResponse.next()
  }
  
  // Admin routes - require authentication and admin panel permission
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", nextUrl))
    }
    const hasAdminAccess = session.user.permissions?.includes("admin:panel") || isSuperAdmin
    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }
    return NextResponse.next()
  }
  
  // Meeting routes - require authentication (except join page which handles its own auth)
  if (pathname.startsWith("/meeting") && !pathname.startsWith("/meeting/join")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl))
    }
    return NextResponse.next()
  }
  
  // Dashboard route - require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/dashboard", nextUrl))
    }
    return NextResponse.next()
  }
  
  // Public routes
  if (isPublicRoute) {
    // Redirect logged in users away from login/register pages
    if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/superadmin", nextUrl))
      }
      return NextResponse.redirect(new URL("/admin", nextUrl))
    }
    return NextResponse.next()
  }
  
  // Protected API routes
  if (pathname.startsWith("/api")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }
  
  // All other routes require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
