import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create Superadmin tenant (platform owner)
  const superadminTenant = await prisma.tenant.upsert({
    where: { slug: "platform" },
    update: {},
    create: {
      name: "KOVIN Platform",
      slug: "platform",
      plan: "ENTERPRISE",
      status: "ACTIVE",
      settings: {
        maxUsers: -1,
        maxMeetingDuration: -1,
        features: ["all"],
      },
      branding: {
        primaryColor: "#0066FF",
        logo: null,
      },
    },
  })
  console.log("Created platform tenant:", superadminTenant.id)

  // Create Superadmin user
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const superadmin = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: "admin@kovin.io",
        tenantId: superadminTenant.id,
      },
    },
    update: {},
    create: {
      tenantId: superadminTenant.id,
      email: "admin@kovin.io",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPERADMIN",
      status: "ACTIVE",
    },
  })
  console.log("Created superadmin user:", superadmin.email)

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo",
      plan: "PROFESSIONAL",
      status: "ACTIVE",
      maxUsers: 50,
      maxMeetingDuration: 120,
      settings: {
        allowGuests: true,
        waitingRoom: true,
        recording: true,
      },
      branding: {
        primaryColor: "#10B981",
        secondaryColor: "#6B7280",
      },
    },
  })
  console.log("Created demo tenant:", demoTenant.id)

  // Create demo admin
  const demoAdmin = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: "admin@demo.com",
        tenantId: demoTenant.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: "admin@demo.com",
      name: "Demo Admin",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  })
  console.log("Created demo admin:", demoAdmin.email)

  // Create demo users
  const demoUsers = await Promise.all(
    [
      { email: "john@demo.com", name: "John Smith", role: "MODERATOR" },
      { email: "jane@demo.com", name: "Jane Doe", role: "USER" },
      { email: "bob@demo.com", name: "Bob Wilson", role: "USER" },
    ].map((user) =>
      prisma.user.upsert({
        where: {
          email_tenantId: {
            email: user.email,
            tenantId: demoTenant.id,
          },
        },
        update: {},
        create: {
          tenantId: demoTenant.id,
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role as "ADMIN" | "MODERATOR" | "USER",
          status: "ACTIVE",
        },
      })
    )
  )
  console.log("Created demo users:", demoUsers.length)

  // Create demo meeting
  const meeting = await prisma.meeting.create({
    data: {
      tenantId: demoTenant.id,
      hostId: demoAdmin.id,
      title: "Team Weekly Standup",
      description: "Weekly team sync to discuss progress and blockers",
      roomId: "demo-room-001",
      accessCode: "DEMO1234",
      status: "SCHEDULED",
      scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledEnd: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
      settings: {
        allowGuests: true,
        waitingRoom: false,
        recording: true,
        chat: true,
        screenShare: true,
      },
      participants: {
        connect: demoUsers.map((u) => ({ id: u.id })),
      },
    },
  })
  console.log("Created demo meeting:", meeting.title)

  // Create demo event
  const event = await prisma.event.create({
    data: {
      tenantId: demoTenant.id,
      title: "Tech Conference 2024",
      slug: "tech-conference-2024",
      description: "Annual technology conference featuring industry leaders",
      longDescription: `
        Join us for the biggest tech conference of the year!
        
        This three-day event brings together industry leaders, innovative startups, 
        and tech enthusiasts from around the world.
        
        Topics include:
        - AI and Machine Learning
        - Cloud Computing
        - Cybersecurity
        - Product Design
        - Startup Growth
      `,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      location: "San Francisco Convention Center",
      address: "747 Howard St, San Francisco, CA 94103",
      isVirtual: true,
      category: "Technology",
      status: "PUBLISHED",
      isPublic: true,
      ticketTypes: {
        create: [
          {
            name: "General Admission",
            description: "Access to all conference sessions",
            price: 99,
            quantity: 500,
            maxPerOrder: 5,
          },
          {
            name: "VIP Pass",
            description: "Premium experience with exclusive perks",
            price: 299,
            quantity: 50,
            maxPerOrder: 2,
          },
          {
            name: "Virtual Attendee",
            description: "Join remotely with full streaming access",
            price: 49,
            quantity: 1000,
            maxPerOrder: 10,
          },
        ],
      },
    },
  })
  console.log("Created demo event:", event.title)

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        userId: demoAdmin.id,
        action: "USER_LOGIN",
        resource: "User",
        resourceId: demoAdmin.id,
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      },
      {
        tenantId: demoTenant.id,
        userId: demoAdmin.id,
        action: "MEETING_CREATED",
        resource: "Meeting",
        resourceId: meeting.id,
        details: { title: meeting.title },
      },
      {
        tenantId: demoTenant.id,
        userId: demoAdmin.id,
        action: "EVENT_CREATED",
        resource: "Event",
        resourceId: event.id,
        details: { title: event.title },
      },
    ],
  })
  console.log("Created audit logs")

  console.log("")
  console.log("==========================================")
  console.log("  Database seeded successfully!")
  console.log("==========================================")
  console.log("")
  console.log("Default credentials:")
  console.log("")
  console.log("Superadmin:")
  console.log("  Email: admin@kovin.io")
  console.log("  Password: admin123")
  console.log("")
  console.log("Demo Admin:")
  console.log("  Email: admin@demo.com")
  console.log("  Password: admin123")
  console.log("")
  console.log("==========================================")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
