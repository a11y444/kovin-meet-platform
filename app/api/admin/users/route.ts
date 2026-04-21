import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {
      tenantId: session.user.tenantId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role && role !== "all") {
      where.role = role
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              hostedMeetings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, password, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists in tenant
    const existing = await prisma.user.findFirst({
      where: {
        email,
        tenantId: session.user.tenantId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check tenant user limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId! },
      include: {
        _count: { select: { users: true } },
      },
    })

    if (tenant && tenant.maxUsers && tenant._count.users >= tenant.maxUsers) {
      return NextResponse.json(
        { error: "User limit reached for this organization" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        tenantId: session.user.tenantId!,
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        role: role || "USER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId!,
        userId: session.user.id,
        action: "USER_CREATED",
        resource: "User",
        resourceId: user.id,
        details: { email, role: role || "USER" },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
