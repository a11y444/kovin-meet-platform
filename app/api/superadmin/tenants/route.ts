import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const tenants = await query(`SELECT * FROM "Tenant" ORDER BY "createdAt" DESC`)
    return NextResponse.json({ tenants })
  } catch (error) {
    console.error("Failed to fetch tenants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, domain, adminEmail, adminPassword } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const tenantId = crypto.randomUUID()
    const tenant = await query(
      `INSERT INTO "Tenant" (id, name, slug, domain, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING *`,
      [tenantId, name, slug, domain]
    )

    // Create admin user if credentials provided
    if (adminEmail && adminPassword) {
      const userId = crypto.randomUUID()
      const hash = await bcrypt.hash(adminPassword, 12)
      await query(
        `INSERT INTO "User" (id, email, "passwordHash", "firstName", "tenantId", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'Admin', $4, true, NOW(), NOW())`,
        [userId, adminEmail, hash, tenantId]
      )
    }

    return NextResponse.json(tenant[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
