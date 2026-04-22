import { NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingCode, guestName } = body

    if (!meetingCode || !guestName) {
      return NextResponse.json({ error: "Meeting code and name are required" }, { status: 400 })
    }

    const meeting = await queryOne(`SELECT * FROM "Meeting" WHERE "roomName" = $1`, [meetingCode.toLowerCase().trim()])

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (meeting.status === "ended") {
      return NextResponse.json({ error: "This meeting has ended" }, { status: 400 })
    }

    return NextResponse.json({
      meetingId: meeting.id,
      title: meeting.title,
      roomName: meeting.roomName,
    })
  } catch (error) {
    console.error("Failed to join meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
