import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { authConfig, PERMISSIONS, hasPermission, type Permission } from "./auth.config"

export { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from "./auth.config"
export type { Permission } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
})

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
