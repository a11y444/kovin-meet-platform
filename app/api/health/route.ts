import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {}
  const startTime = Date.now()

  // Check database
  try {
    const dbStart = Date.now()
    await pool.query("SELECT 1")
    checks.database = {
      status: "healthy",
      latency: Date.now() - dbStart,
    }
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Check memory usage
  const memUsage = process.memoryUsage()
  checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? "healthy" : "warning",
    latency: Math.round(memUsage.heapUsed / 1024 / 1024),
  }

  // Overall status
  const isHealthy = Object.values(checks).every(
    (check) => check.status === "healthy" || check.status === "warning"
  )

  const response = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalLatency: Date.now() - startTime,
    checks,
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  }

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
