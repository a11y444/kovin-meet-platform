import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get("public") === "true"
    const limit = parseInt(searchParams.get("limit") || "50")

    let sql = `SELECT * FROM "Event" WHERE "startsAt" > NOW()`
    const params: any[] = []
    
    if (isPublic) {
      sql += ` AND "isPublic" = true`
    }
    
    sql += ` ORDER BY "startsAt" ASC LIMIT $${params.length + 1}`
    params.push(limit)

    const events = await query(sql, params)
    return NextResponse.json({ events, total: events.length })
  } catch (error) {
    console.error("Failed to fetch events:", error)
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
    const { title, description, startsAt, location, isPublic } = body

    if (!title || !startsAt || !location) {
      return NextResponse.json(
        { error: "Title, start date, and location are required" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const event = await query(
      `INSERT INTO "Event" (id, title, description, "startsAt", location, "isPublic", "tenantId", "organizerId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
      [id, title, description, new Date(startsAt), location, isPublic ?? true, session.user.tenantId, session.user.id]
    )

    return NextResponse.json(event[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
