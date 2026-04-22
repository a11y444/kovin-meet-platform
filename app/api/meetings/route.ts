import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    let sql = `SELECT * FROM "Meeting"`
    const params: any[] = []
    
    if (session.user.tenantId) {
      sql += ` WHERE "tenantId" = $1`
      params.push(session.user.tenantId)
    }
    
    sql += ` ORDER BY "scheduledAt" DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const meetings = await query(sql, params)
    return NextResponse.json({ meetings, total: meetings.length })
  } catch (error) {
    console.error("Failed to fetch meetings:", error)
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
    const { title, description, scheduledAt } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const roomName = `room-${id.slice(0, 8)}`
    
    const meeting = await query(
      `INSERT INTO "Meeting" (id, title, description, "roomName", "scheduledAt", status, "tenantId", "hostId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7, NOW(), NOW()) RETURNING *`,
      [id, title, description, roomName, scheduledAt ? new Date(scheduledAt) : new Date(), session.user.tenantId, session.user.id]
    )

    return NextResponse.json(meeting[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
