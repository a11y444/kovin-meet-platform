import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { queryOne } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Ticket code is required" }, { status: 400 })
    }

    const ticket = await queryOne(`SELECT * FROM "Ticket" WHERE code = $1`, [code])

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ ticket, valid: ticket.status === "valid" })
  } catch (error) {
    console.error("Failed to validate ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
