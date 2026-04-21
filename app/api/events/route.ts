import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isPublic = searchParams.get("public") === "true"
    const tenantSlug = searchParams.get("tenant")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      startDate: { gte: new Date() },
    }

    if (isPublic) {
      where.isPublic = true
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (tenantSlug) {
      where.tenant = { slug: tenantSlug }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          tenant: {
            select: {
              name: true,
              slug: true,
              logo: true,
            },
          },
          ticketTypes: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              sold: true,
            },
          },
          _count: {
            select: { tickets: true },
          },
        },
        orderBy: { startDate: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ])

    // Transform events to include available tickets
    const transformedEvents = events.map((event) => ({
      ...event,
      ticketTypes: event.ticketTypes.map((tt) => ({
        ...tt,
        available: tt.quantity - tt.sold,
      })),
    }))

    return NextResponse.json({ events: transformedEvents, total })
  } catch (error) {
    console.error("Failed to fetch events:", error)
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
      longDescription,
      startDate,
      endDate,
      location,
      address,
      isVirtual,
      meetingId,
      category,
      coverImage,
      isPublic,
      ticketTypes,
    } = body

    if (!title || !startDate || !location) {
      return NextResponse.json(
        { error: "Title, start date, and location are required" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        tenantId: session.user.tenantId!,
        title,
        slug: `${title.toLowerCase().replace(/\s+/g, "-")}-${nanoid(6)}`,
        description,
        longDescription,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        address,
        isVirtual: isVirtual || false,
        meetingId,
        category,
        coverImage,
        isPublic: isPublic ?? true,
        status: "DRAFT",
        ticketTypes: ticketTypes
          ? {
              create: ticketTypes.map((tt: Record<string, unknown>) => ({
                name: tt.name,
                description: tt.description,
                price: tt.price,
                quantity: tt.quantity,
                maxPerOrder: tt.maxPerOrder || 10,
                salesStart: tt.salesStart ? new Date(tt.salesStart as string) : null,
                salesEnd: tt.salesEnd ? new Date(tt.salesEnd as string) : null,
              })),
            }
          : undefined,
      },
      include: {
        ticketTypes: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId!,
        userId: session.user.id,
        action: "EVENT_CREATED",
        resource: "Event",
        resourceId: event.id,
        details: { title },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
