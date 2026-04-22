import { NextRequest, NextResponse } from "next/server"
import { WebhookReceiver } from "livekit-server-sdk"
import { query, queryOne } from "@/lib/db"

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 })
    }

    const event = await receiver.receive(body, authHeader)
    console.log("LiveKit webhook event:", event.event)

    switch (event.event) {
      case "room_started": {
        const roomName = event.room?.name
        if (roomName) {
          await query(
            `UPDATE "Meeting" SET status = 'active', "startedAt" = NOW() WHERE "roomName" = $1`,
            [roomName]
          )
        }
        break
      }

      case "room_finished": {
        const roomName = event.room?.name
        if (roomName) {
          await query(
            `UPDATE "Meeting" SET status = 'ended', "endedAt" = NOW() WHERE "roomName" = $1`,
            [roomName]
          )
        }
        break
      }

      case "participant_joined":
      case "participant_left":
        // Log participant events if needed
        break

      default:
        console.log("Unhandled LiveKit event:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("LiveKit webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
