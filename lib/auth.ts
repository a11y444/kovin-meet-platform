import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const email = credentials.email as string
        const password = credentials.password as string
        const tenantSlug = credentials.tenantSlug as string | undefined

        // Find user - if tenantSlug provided, search within that tenant
        // Otherwise, for super admins, they can log in without tenant context
        let user
        
        if (tenantSlug) {
          const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
          })
          
          if (!tenant || !tenant.isActive) {
            throw new Error("Invalid tenant or tenant is inactive")
          }
          
          user = await prisma.user.findUnique({
            where: {
              email_tenantId: {
                email,
                tenantId: tenant.id,
              },
            },
            include: {
              tenant: true,
              role: true,
            },
          })
        } else {
          // Super admin login - find by email across all tenants
          user = await prisma.user.findFirst({
            where: {
              email,
              isSuperAdmin: true,
            },
            include: {
              tenant: true,
              role: true,
            },
          })
        }

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials or user is inactive")
        }

        if (!user.passwordHash) {
          throw new Error("Password not set for this account")
        }

        const isValid = await compare(password, user.passwordHash)
        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Create audit log
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: "LOGIN",
            entityType: "User",
            entityId: user.id,
            description: `User ${user.email} logged in`,
          },
        })

        const permissions = (user.role.permissions as string[]) || []

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          image: user.avatarUrl,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug,
          roleId: user.roleId,
          roleName: user.role.name,
          permissions,
          isSuperAdmin: user.isSuperAdmin,
        }
      },
    }),
  ],
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
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

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

// Middleware helper for API routes
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth()
  if (!hasPermission(session.user.permissions, permission)) {
    throw new Error("Forbidden: Insufficient permissions")
  }
  return session
}

export async function requireSuperAdmin() {
  const session = await requireAuth()
  if (!session.user.isSuperAdmin) {
    throw new Error("Forbidden: Super admin access required")
  }
  return session
}

export async function requireTenant(tenantId: string) {
  const session = await requireAuth()
  if (session.user.tenantId !== tenantId && !session.user.isSuperAdmin) {
    throw new Error("Forbidden: Access denied to this tenant")
  }
  return session
}
