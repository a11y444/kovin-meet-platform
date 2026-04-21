import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {
      tenantId: session.user.tenantId,
    }

    if (status) {
      where.status = status
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledStart: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.meeting.count({ where }),
    ])

    return NextResponse.json({ meetings, total })
  } catch (error) {
    console.error("Failed to fetch meetings:", error)
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
    const {
      title,
      description,
      scheduledStart,
      scheduledEnd,
      isRecurring,
      recurringPattern,
      participantIds,
      settings,
    } = body

    if (!title || !scheduledStart) {
      return NextResponse.json(
        { error: "Title and scheduled start are required" },
        { status: 400 }
      )
    }

    const roomId = nanoid(12)
    const accessCode = nanoid(8).toUpperCase()

    const meeting = await prisma.meeting.create({
      data: {
        tenantId: session.user.tenantId!,
        hostId: session.user.id,
        title,
        description,
        roomId,
        accessCode,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        isRecurring: isRecurring || false,
        recurringPattern,
        settings: settings || {},
        participants: participantIds?.length
          ? {
              connect: participantIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId!,
        userId: session.user.id,
        action: "MEETING_CREATED",
        resource: "Meeting",
        resourceId: meeting.id,
        details: { title, roomId },
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    console.error("Failed to create meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
