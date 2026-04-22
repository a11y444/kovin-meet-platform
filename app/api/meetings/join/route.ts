import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { meetingCode, guestName, guestEmail, password } = body

    if (!meetingCode || !guestName) {
      return NextResponse.json(
        { error: "Meeting code and name are required" },
        { status: 400 }
      )
    }

    // Find meeting by room code
    const meeting = await prisma.meeting.findUnique({
      where: { roomCode: meetingCode.toLowerCase().trim() },
      include: {
        tenant: {
          select: {
            isActive: true,
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (!meeting.tenant.isActive) {
      return NextResponse.json({ error: "This meeting is no longer available" }, { status: 403 })
    }

    // Check meeting status
    if (meeting.status === "CANCELLED") {
      return NextResponse.json({ error: "This meeting has been cancelled" }, { status: 400 })
    }

    if (meeting.status === "ENDED") {
      return NextResponse.json({ error: "This meeting has ended" }, { status: 400 })
    }

    // Check password if required
    if (meeting.password && meeting.password !== password) {
      return NextResponse.json({ error: "Invalid meeting password" }, { status: 401 })
    }

    // Check if meeting is public or requires waiting room
    const settings = meeting.settings as Record<string, unknown> || {}
    const hasWaitingRoom = settings.waitingRoom === true
    const maxParticipants = settings.maxParticipants as number | undefined

    // Check participant limit
    if (maxParticipants) {
      const currentParticipants = await prisma.meetingParticipant.count({
        where: {
          meetingId: meeting.id,
          isAdmitted: true,
          leftAt: null,
        },
      })

      if (currentParticipants >= maxParticipants) {
        return NextResponse.json({ error: "Meeting is at capacity" }, { status: 403 })
      }
    }

    // Create guest participant record
    const participant = await prisma.meetingParticipant.create({
      data: {
        meetingId: meeting.id,
        guestName,
        guestEmail: guestEmail || null,
        role: "ATTENDEE",
        isInWaitingRoom: hasWaitingRoom,
        isAdmitted: !hasWaitingRoom,
      },
    })

    return NextResponse.json({
      meetingId: meeting.id,
      participantId: participant.id,
      title: meeting.title,
      inWaitingRoom: hasWaitingRoom,
    })
  } catch (error) {
    console.error("Error joining meeting:", error)
    return NextResponse.json({ error: "Failed to join meeting" }, { status: 500 })
  }
}
