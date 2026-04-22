import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let roles
    if (session.user.tenantId) {
      roles = await query(`SELECT * FROM "Role" WHERE "tenantId" = $1 ORDER BY name ASC`, [session.user.tenantId])
    } else {
      roles = await query(`SELECT * FROM "Role" ORDER BY name ASC`)
    }

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Failed to fetch roles:", error)
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
    const { name, permissions } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const role = await query(
      `INSERT INTO "Role" (id, name, "tenantId", permissions, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [id, name, session.user.tenantId, JSON.stringify(permissions || [])]
    )

    return NextResponse.json(role[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
