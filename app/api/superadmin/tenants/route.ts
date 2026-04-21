import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
      ]
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              meetings: true,
              events: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.tenant.count({ where }),
    ])

    return NextResponse.json({ tenants, total })
  } catch (error) {
    console.error("Failed to fetch tenants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      domain,
      plan,
      settings,
      branding,
      adminEmail,
      adminName,
      adminPassword,
    } = body

    if (!name || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Name, slug, admin email, and password are required" },
        { status: 400 }
      )
    }

    // Check if slug or domain already exists
    const existing = await prisma.tenant.findFirst({
      where: {
        OR: [{ slug }, ...(domain ? [{ domain }] : [])],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Slug or domain already in use" },
        { status: 400 }
      )
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create tenant with admin user
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain,
        plan: plan || "BASIC",
        status: "ACTIVE",
        settings: settings || {},
        branding: branding || {},
        users: {
          create: {
            email: adminEmail,
            name: adminName || "Admin",
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            users: true,
            meetings: true,
            events: true,
          },
        },
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: "TENANT_CREATED",
        resource: "Tenant",
        resourceId: tenant.id,
        details: { name, slug, plan: plan || "BASIC" },
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error("Failed to create tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
