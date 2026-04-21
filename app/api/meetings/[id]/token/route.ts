import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AccessToken } from "livekit-server-sdk"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { accessCode, guestName } = body

    const session = await auth()

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        host: true,
        tenant: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    let participantName: string
    let participantIdentity: string
    let isHost = false

    if (session?.user) {
      // Authenticated user
      if (meeting.tenantId !== session.user.tenantId && session.user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
      participantName = session.user.name || session.user.email || "Participant"
      participantIdentity = session.user.id
      isHost = meeting.hostId === session.user.id
    } else {
      // Guest access
      if (!meeting.settings || !(meeting.settings as Record<string, unknown>).allowGuests) {
        return NextResponse.json({ error: "Guest access not allowed" }, { status: 403 })
      }
      if (meeting.accessCode !== accessCode) {
        return NextResponse.json({ error: "Invalid access code" }, { status: 403 })
      }
      if (!guestName) {
        return NextResponse.json({ error: "Guest name required" }, { status: 400 })
      }
      participantName = guestName
      participantIdentity = `guest_${Date.now()}`
    }

    // Check meeting status
    if (meeting.status === "ENDED" || meeting.status === "CANCELLED") {
      return NextResponse.json({ error: "Meeting has ended" }, { status: 400 })
    }

    // Generate LiveKit token
    const livekitApiKey = process.env.LIVEKIT_API_KEY
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET

    if (!livekitApiKey || !livekitApiSecret) {
      return NextResponse.json(
        { error: "LiveKit not configured" },
        { status: 500 }
      )
    }

    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: "6h",
    })

    token.addGrant({
      room: meeting.roomId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
      roomRecord: isHost,
    })

    const jwt = await token.toJwt()

    // Update meeting status if starting
    if (meeting.status === "SCHEDULED") {
      await prisma.meeting.update({
        where: { id },
        data: {
          status: "IN_PROGRESS",
          actualStart: new Date(),
        },
      })
    }

    return NextResponse.json({
      token: jwt,
      roomId: meeting.roomId,
      livekitUrl: process.env.LIVEKIT_URL || "wss://localhost:7880",
      isHost,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        hostName: meeting.host.name,
      },
    })
  } catch (error) {
    console.error("Failed to generate token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
