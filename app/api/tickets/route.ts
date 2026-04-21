import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const email = searchParams.get("email")

    const where: Record<string, unknown> = {}

    if (eventId) {
      where.eventId = eventId
    }

    if (email) {
      where.attendeeEmail = email
    }

    // If authenticated, show user's tickets or all tickets for admin
    if (session?.user) {
      if (session.user.role === "ADMIN" || session.user.role === "SUPERADMIN") {
        // Admin can see all tickets for their tenant
        where.event = { tenantId: session.user.tenantId }
      } else {
        // Regular users see their own tickets
        where.attendeeEmail = session.user.email
      }
    } else if (!email) {
      return NextResponse.json({ error: "Email required for guest access" }, { status: 400 })
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            isVirtual: true,
            tenant: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
        ticketType: {
          select: {
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Failed to fetch tickets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventId,
      ticketTypeId,
      quantity,
      attendeeName,
      attendeeEmail,
      paymentIntentId,
    } = body

    if (!eventId || !ticketTypeId || !quantity || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get event and ticket type
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true },
    })

    if (!ticketType) {
      return NextResponse.json({ error: "Ticket type not found" }, { status: 404 })
    }

    if (ticketType.eventId !== eventId) {
      return NextResponse.json({ error: "Ticket type does not match event" }, { status: 400 })
    }

    // Check availability
    const available = ticketType.quantity - ticketType.sold
    if (quantity > available) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 })
    }

    if (quantity > ticketType.maxPerOrder) {
      return NextResponse.json({ error: `Maximum ${ticketType.maxPerOrder} tickets per order` }, { status: 400 })
    }

    // Create tickets
    const tickets = await prisma.$transaction(async (tx) => {
      // Update sold count
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { sold: { increment: quantity } },
      })

      // Create individual tickets
      const createdTickets = []
      for (let i = 0; i < quantity; i++) {
        const ticketNumber = generateTicketNumber(ticketType.event.title, ticketType.name)
        const ticket = await tx.ticket.create({
          data: {
            eventId,
            ticketTypeId,
            ticketNumber,
            attendeeName,
            attendeeEmail,
            price: ticketType.price,
            status: "VALID",
            paymentId: paymentIntentId,
            qrCode: ticketNumber, // QR code contains ticket number
          },
        })
        createdTickets.push(ticket)
      }

      return createdTickets
    })

    // Log the purchase
    await prisma.auditLog.create({
      data: {
        tenantId: ticketType.event.tenantId,
        action: "TICKETS_PURCHASED",
        resource: "Ticket",
        details: {
          eventId,
          ticketTypeId,
          quantity,
          attendeeEmail,
          ticketIds: tickets.map((t) => t.id),
        },
      },
    })

    return NextResponse.json({ tickets }, { status: 201 })
  } catch (error) {
    console.error("Failed to create tickets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateTicketNumber(eventTitle: string, ticketType: string): string {
  const prefix = eventTitle
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
  const typeCode = ticketType.slice(0, 2).toUpperCase()
  const random = nanoid(6).toUpperCase()
  return `${prefix}-${typeCode}-${random}`
}
