import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let users
    if (session.user.isSuperAdmin) {
      users = await query(`SELECT id, email, "firstName", "lastName", "isSuperAdmin", "isActive", "createdAt" FROM "User" ORDER BY "createdAt" DESC`)
    } else if (session.user.tenantId) {
      users = await query(`SELECT id, email, "firstName", "lastName", "isActive", "createdAt" FROM "User" WHERE "tenantId" = $1 ORDER BY "createdAt" DESC`, [session.user.tenantId])
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const hash = await bcrypt.hash(password, 12)

    const user = await query(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW()) RETURNING id, email, "firstName", "lastName"`,
      [id, email, hash, firstName, lastName, session.user.tenantId]
    )

    return NextResponse.json(user[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
