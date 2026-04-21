import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "USER" | null
      tenantId: string | null
      tenantSlug: string | null
      tenantName: string | null
      avatar: string | null
      permissions: string[]
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "USER"
    tenantId: string | null
    tenantSlug: string | null
    tenantName: string | null
    avatar: string | null
    permissions: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "USER" | null
    tenantId: string | null
    tenantSlug: string | null
    tenantName: string | null
    avatar: string | null
    permissions: string[]
  }
}
