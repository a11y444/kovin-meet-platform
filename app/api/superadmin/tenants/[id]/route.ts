import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const tenant = await queryOne(`SELECT * FROM "Tenant" WHERE id = $1`, [id])

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Failed to fetch tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, domain, isActive } = body

    const tenant = await query(
      `UPDATE "Tenant" SET 
        name = COALESCE($1, name),
        domain = COALESCE($2, domain),
        "isActive" = COALESCE($3, "isActive"),
        "updatedAt" = NOW()
       WHERE id = $4 RETURNING *`,
      [name, domain, isActive, id]
    )

    if (!tenant.length) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    return NextResponse.json(tenant[0])
  } catch (error) {
    console.error("Failed to update tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    await query(`UPDATE "Tenant" SET "isActive" = false WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
