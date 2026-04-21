import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Find ticket by ID or ticket number
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }, { qrCode: id }],
      },
      include: {
        event: {
          include: {
            tenant: true,
          },
        },
        ticketType: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { valid: false, error: "Ticket not found" },
        { status: 404 }
      )
    }

    // Check tenant access
    if (
      ticket.event.tenantId !== session.user.tenantId &&
      session.user.role !== "SUPERADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check ticket status
    if (ticket.status === "USED") {
      return NextResponse.json({
        valid: false,
        error: "Ticket already used",
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType.name,
          checkedInAt: ticket.checkedInAt,
        },
      })
    }

    if (ticket.status === "CANCELLED") {
      return NextResponse.json({
        valid: false,
        error: "Ticket has been cancelled",
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType.name,
        },
      })
    }

    if (ticket.status === "REFUNDED") {
      return NextResponse.json({
        valid: false,
        error: "Ticket has been refunded",
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType.name,
        },
      })
    }

    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "USED",
        checkedInAt: new Date(),
        checkedInBy: session.user.id,
      },
    })

    // Log the check-in
    await prisma.auditLog.create({
      data: {
        tenantId: ticket.event.tenantId,
        userId: session.user.id,
        action: "TICKET_CHECKED_IN",
        resource: "Ticket",
        resourceId: ticket.id,
        details: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendeeName,
          eventId: ticket.eventId,
        },
      },
    })

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        ticketType: ticket.ticketType.name,
        event: {
          title: ticket.event.title,
          startDate: ticket.event.startDate,
        },
        checkedInAt: updatedTicket.checkedInAt,
      },
    })
  } catch (error) {
    console.error("Failed to validate ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
