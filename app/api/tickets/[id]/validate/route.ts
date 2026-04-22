import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const ticket = await queryOne(
      `SELECT * FROM "Ticket" WHERE id = $1 OR code = $1`,
      [id]
    )

    if (!ticket) {
      return NextResponse.json({ valid: false, error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.status === "used") {
      return NextResponse.json({
        valid: false,
        error: "Ticket already used",
        ticket: { code: ticket.code, checkedInAt: ticket.checkedInAt },
      })
    }

    if (ticket.status !== "valid") {
      return NextResponse.json({
        valid: false,
        error: `Ticket is ${ticket.status}`,
        ticket: { code: ticket.code },
      })
    }

    // Mark as used
    await query(
      `UPDATE "Ticket" SET status = 'used', "checkedInAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
      [ticket.id]
    )

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        code: ticket.code,
        checkedInAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Failed to validate ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
