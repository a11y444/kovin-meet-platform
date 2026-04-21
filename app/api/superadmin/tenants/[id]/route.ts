import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
            lastLogin: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            users: true,
            meetings: true,
            events: true,
            tickets: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Failed to fetch tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const {
      name,
      domain,
      plan,
      status,
      settings,
      branding,
      maxUsers,
      maxMeetingDuration,
      maxRecordingStorage,
      features,
    } = body

    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Check domain uniqueness if changing
    if (domain && domain !== tenant.domain) {
      const existing = await prisma.tenant.findFirst({
        where: { domain, id: { not: id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: "Domain already in use" },
          { status: 400 }
        )
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain !== undefined && { domain }),
        ...(plan && { plan }),
        ...(status && { status }),
        ...(settings && { settings }),
        ...(branding && { branding }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(maxMeetingDuration !== undefined && { maxMeetingDuration }),
        ...(maxRecordingStorage !== undefined && { maxRecordingStorage }),
        ...(features && { features }),
      },
      include: {
        _count: {
          select: {
            users: true,
            meetings: true,
            events: true,
          },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: id,
        userId: session.user.id,
        action: "TENANT_UPDATED",
        resource: "Tenant",
        resourceId: id,
        details: body,
      },
    })

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error("Failed to update tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Soft delete by setting status to SUSPENDED
    await prisma.tenant.update({
      where: { id },
      data: { status: "SUSPENDED" },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: id,
        userId: session.user.id,
        action: "TENANT_SUSPENDED",
        resource: "Tenant",
        resourceId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete tenant:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
