import type { NextAuthConfig } from "next-auth"

// Permission definitions for RBAC
export const PERMISSIONS = {
  // User management
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",
  
  // Role management
  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",
  
  // Meeting management
  MEETINGS_CREATE: "meetings:create",
  MEETINGS_READ: "meetings:read",
  MEETINGS_UPDATE: "meetings:update",
  MEETINGS_DELETE: "meetings:delete",
  MEETINGS_HOST: "meetings:host",
  MEETINGS_RECORD: "meetings:record",
  
  // Event management
  EVENTS_CREATE: "events:create",
  EVENTS_READ: "events:read",
  EVENTS_UPDATE: "events:update",
  EVENTS_DELETE: "events:delete",
  
  // Ticket management
  TICKETS_READ: "tickets:read",
  TICKETS_WRITE: "tickets:write",
  TICKETS_REFUND: "tickets:refund",
  
  // Calendar management
  CALENDAR_READ: "calendar:read",
  CALENDAR_WRITE: "calendar:write",
  
  // Email management
  EMAIL_READ: "email:read",
  EMAIL_SEND: "email:send",
  EMAIL_CAMPAIGNS: "email:campaigns",
  
  // Analytics
  ANALYTICS_READ: "analytics:read",
  
  // Admin
  ADMIN_PANEL: "admin:panel",
  TENANT_SETTINGS: "tenant:settings",
  
  // Super admin (platform level)
  SUPERADMIN: "superadmin:all",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.SUPERADMIN),
  moderator: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.MEETINGS_CREATE,
    PERMISSIONS.MEETINGS_READ,
    PERMISSIONS.MEETINGS_UPDATE,
    PERMISSIONS.MEETINGS_HOST,
    PERMISSIONS.MEETINGS_RECORD,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ADMIN_PANEL,
  ],
  presenter: [
    PERMISSIONS.MEETINGS_CREATE,
    PERMISSIONS.MEETINGS_READ,
    PERMISSIONS.MEETINGS_HOST,
    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_WRITE,
  ],
  attendee: [
    PERMISSIONS.MEETINGS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.CALENDAR_READ,
  ],
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      tenantId: string
      tenantSlug: string
      roleId: string
      roleName: string
      permissions: string[]
      isSuperAdmin: boolean
    }
  }
  
  interface User {
    tenantId: string
    tenantSlug: string
    roleId: string
    roleName: string
    permissions: string[]
    isSuperAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId: string
    tenantSlug: string
    roleId: string
    roleName: string
    permissions: string[]
    isSuperAdmin: boolean
  }
}

// Auth config that can be used by middleware (no prisma imports)
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug
        token.roleId = user.roleId
        token.roleName = user.roleName
        token.permissions = user.permissions
        token.isSuperAdmin = user.isSuperAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.tenantId = token.tenantId
        session.user.tenantSlug = token.tenantSlug
        session.user.roleId = token.roleId
        session.user.roleName = token.roleName
        session.user.permissions = token.permissions
        session.user.isSuperAdmin = token.isSuperAdmin
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isSuperAdmin = auth?.user?.isSuperAdmin ?? false
      const pathname = nextUrl.pathname
      
      // Public routes
      const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/events", "/meeting/join"]
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
      
      // Static files
      if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".")) {
        return true
      }
      
      // Super admin routes
      if (pathname.startsWith("/superadmin")) {
        if (!isLoggedIn) return false
        return isSuperAdmin
      }
      
      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false
        const hasAdminAccess = auth?.user?.permissions?.includes("admin:panel") || isSuperAdmin
        return hasAdminAccess
      }
      
      // Meeting routes
      if (pathname.startsWith("/meeting") && !pathname.startsWith("/meeting/join")) {
        return isLoggedIn
      }
      
      // Dashboard
      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn
      }
      
      // Public routes
      if (isPublicRoute) {
        return true
      }
      
      // Protected API routes
      if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/public")) {
        return isLoggedIn
      }
      
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

// Helper functions for RBAC
export function hasPermission(userPermissions: string[], permission: Permission): boolean {
  return userPermissions.includes(permission) || userPermissions.includes(PERMISSIONS.SUPERADMIN)
}

export function hasAnyPermission(userPermissions: string[], permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(userPermissions, p))
}

export function hasAllPermissions(userPermissions: string[], permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(userPermissions, p))
}
