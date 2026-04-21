import { NextRequest, NextResponse } from "next/server"
import { WebhookReceiver } from "livekit-server-sdk"
import { prisma } from "@/lib/prisma"

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

    // Verify webhook signature
    const event = await receiver.receive(body, authHeader)

    console.log("LiveKit webhook event:", event.event)

    switch (event.event) {
      case "room_started": {
        // Room created
        const roomName = event.room?.name
        if (roomName) {
          await prisma.meeting.updateMany({
            where: { roomId: roomName },
            data: {
              status: "IN_PROGRESS",
              actualStart: new Date(),
            },
          })
        }
        break
      }

      case "room_finished": {
        // Room ended
        const roomName = event.room?.name
        if (roomName) {
          await prisma.meeting.updateMany({
            where: { roomId: roomName },
            data: {
              status: "ENDED",
              actualEnd: new Date(),
            },
          })
        }
        break
      }

      case "participant_joined": {
        // Participant joined
        const roomName = event.room?.name
        const participant = event.participant
        if (roomName && participant) {
          // Log participant join
          const meeting = await prisma.meeting.findFirst({
            where: { roomId: roomName },
          })
          if (meeting) {
            await prisma.auditLog.create({
              data: {
                tenantId: meeting.tenantId,
                action: "PARTICIPANT_JOINED",
                resource: "Meeting",
                resourceId: meeting.id,
                details: {
                  participantId: participant.identity,
                  participantName: participant.name,
                },
              },
            })
          }
        }
        break
      }

      case "participant_left": {
        // Participant left
        const roomName = event.room?.name
        const participant = event.participant
        if (roomName && participant) {
          const meeting = await prisma.meeting.findFirst({
            where: { roomId: roomName },
          })
          if (meeting) {
            await prisma.auditLog.create({
              data: {
                tenantId: meeting.tenantId,
                action: "PARTICIPANT_LEFT",
                resource: "Meeting",
                resourceId: meeting.id,
                details: {
                  participantId: participant.identity,
                  participantName: participant.name,
                },
              },
            })
          }
        }
        break
      }

      case "track_published": {
        // Track published (audio/video/screen)
        break
      }

      case "egress_started": {
        // Recording started
        const egressInfo = event.egressInfo
        if (egressInfo?.roomName) {
          const meeting = await prisma.meeting.findFirst({
            where: { roomId: egressInfo.roomName },
          })
          if (meeting) {
            await prisma.recording.create({
              data: {
                meetingId: meeting.id,
                tenantId: meeting.tenantId,
                egressId: egressInfo.egressId,
                status: "RECORDING",
              },
            })
          }
        }
        break
      }

      case "egress_ended": {
        // Recording ended
        const egressInfo = event.egressInfo
        if (egressInfo) {
          await prisma.recording.updateMany({
            where: { egressId: egressInfo.egressId },
            data: {
              status: "COMPLETED",
              duration: egressInfo.endedAt
                ? Math.floor((egressInfo.endedAt - (egressInfo.startedAt || 0)) / 1000)
                : null,
            },
          })
        }
        break
      }

      default:
        console.log("Unhandled LiveKit event:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("LiveKit webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
