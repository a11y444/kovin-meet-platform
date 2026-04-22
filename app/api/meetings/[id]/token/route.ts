import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { queryOne } from "@/lib/db"
import { AccessToken } from "livekit-server-sdk"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { guestName } = body

    const session = await auth()
    const meeting = await queryOne(`SELECT * FROM "Meeting" WHERE id = $1`, [id])

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    let participantName: string
    let participantIdentity: string
    let isHost = false

    if (session?.user) {
      participantName = session.user.name || session.user.email || "Participant"
      participantIdentity = session.user.id
      isHost = meeting.hostId === session.user.id
    } else {
      if (!guestName) {
        return NextResponse.json({ error: "Guest name required" }, { status: 400 })
      }
      participantName = guestName
      participantIdentity = `guest_${Date.now()}`
    }

    if (meeting.status === "ended") {
      return NextResponse.json({ error: "Meeting has ended" }, { status: 400 })
    }

    const livekitApiKey = process.env.LIVEKIT_API_KEY
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET

    if (!livekitApiKey || !livekitApiSecret) {
      return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 })
    }

    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: "6h",
    })

    token.addGrant({
      room: meeting.roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
      roomRecord: isHost,
    })

    const jwt = await token.toJwt()

    return NextResponse.json({
      token: jwt,
      roomName: meeting.roomName,
      livekitUrl: process.env.LIVEKIT_URL || "wss://localhost:7880",
      isHost,
      meeting: {
        id: meeting.id,
        title: meeting.title,
      },
    })
  } catch (error) {
    console.error("Failed to generate token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
