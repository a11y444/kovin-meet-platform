import { NextResponse } from "next/server"
import { auth, requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roles = await prisma.role.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { name, displayName, description, permissions } = body

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and display name are required" },
        { status: 400 }
      )
    }

    // Check if role already exists
    const existing = await prisma.role.findUnique({
      where: {
        name_tenantId: {
          name,
          tenantId: session.user.tenantId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Role with this name already exists" },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        permissions: permissions || [],
        tenantId: session.user.tenantId,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "Role",
        entityId: role.id,
        description: `Created role: ${role.displayName}`,
      },
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
  }
}
