import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    let tickets
    if (eventId) {
      tickets = await query(`SELECT * FROM "Ticket" WHERE "eventId" = $1 ORDER BY "createdAt" DESC`, [eventId])
    } else if (session?.user?.email) {
      tickets = await query(`SELECT * FROM "Ticket" WHERE "userId" = $1 ORDER BY "createdAt" DESC`, [session.user.id])
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Failed to fetch tickets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userId } = body

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const code = `TKT-${id.slice(0, 8).toUpperCase()}`

    const ticket = await query(
      `INSERT INTO "Ticket" (id, code, "eventId", "userId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'valid', NOW(), NOW()) RETURNING *`,
      [id, code, eventId, userId]
    )

    return NextResponse.json(ticket[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
