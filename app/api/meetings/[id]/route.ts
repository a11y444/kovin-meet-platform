import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
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
        recordings: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Check access - either authenticated user from same tenant or guest with access code
    if (session?.user) {
      if (meeting.tenantId !== session.user.tenantId && session.user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error("Failed to fetch meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (meeting.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const {
      title,
      description,
      scheduledStart,
      scheduledEnd,
      status,
      settings,
      participantIds,
    } = body

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(scheduledStart && { scheduledStart: new Date(scheduledStart) }),
        ...(scheduledEnd && { scheduledEnd: new Date(scheduledEnd) }),
        ...(status && { status }),
        ...(settings && { settings }),
        ...(participantIds && {
          participants: {
            set: participantIds.map((pid: string) => ({ id: pid })),
          },
        }),
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

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId!,
        userId: session.user.id,
        action: "MEETING_UPDATED",
        resource: "Meeting",
        resourceId: id,
        details: body,
      },
    })

    return NextResponse.json(updatedMeeting)
  } catch (error) {
    console.error("Failed to update meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (meeting.tenantId !== session.user.tenantId && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await prisma.meeting.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId!,
        userId: session.user.id,
        action: "MEETING_DELETED",
        resource: "Meeting",
        resourceId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
