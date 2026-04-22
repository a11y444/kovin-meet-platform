import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Ticket code is required" }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode: code },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            tenantId: true,
          },
        },
        ticketType: {
          select: {
            name: true,
            price: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Check tenant access
    if (ticket.event.tenantId !== session.user.tenantId && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check ticket status
    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      return NextResponse.json({ error: `Ticket has been ${ticket.status.toLowerCase()}` }, { status: 400 })
    }

    const holderName = ticket.user 
      ? `${ticket.user.firstName || ''} ${ticket.user.lastName || ''}`.trim() || ticket.user.email
      : ticket.guestName || "Unknown"

    const holderEmail = ticket.user?.email || ticket.guestEmail || "Unknown"

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        eventTitle: ticket.event.title,
        ticketType: ticket.ticketType.name,
        holderName,
        holderEmail,
        isCheckedIn: ticket.isCheckedIn,
        checkedInAt: ticket.checkedInAt,
        status: ticket.status,
      },
    })
  } catch (error) {
    console.error("Error validating ticket:", error)
    return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 })
  }
}
