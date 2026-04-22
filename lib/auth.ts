import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "./db"
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email
        const user = await db.users.findByEmail(email)

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

        // Get tenant if user has one
        let tenant = null
        if (user.tenantId) {
          tenant = await db.tenants.findById(user.tenantId)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          image: user.avatarUrl,
          tenantId: user.tenantId || null,
          tenantSlug: tenant?.slug || null,
          roleId: user.roleId || null,
          roleName: user.isSuperAdmin ? "Superadmin" : "User",
          permissions: [],
          isSuperAdmin: user.isSuperAdmin || false,
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
