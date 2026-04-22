import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export { pool }

// Helper for queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// User queries
export const db = {
  users: {
    findByEmail: (email: string) => 
      queryOne<any>('SELECT * FROM "User" WHERE email = $1', [email]),
    
    findById: (id: string) => 
      queryOne<any>('SELECT * FROM "User" WHERE id = $1', [id]),
    
    create: (data: { id: string; email: string; passwordHash: string; firstName?: string; lastName?: string; isSuperAdmin?: boolean }) =>
      queryOne<any>(
        `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", "isSuperAdmin", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW()) RETURNING *`,
        [data.id, data.email, data.passwordHash, data.firstName || '', data.lastName || '', data.isSuperAdmin || false]
      ),
    
    updatePassword: (email: string, passwordHash: string) =>
      query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE email = $2', [passwordHash, email]),
  },
  
  tenants: {
    findBySlug: (slug: string) =>
      queryOne<any>('SELECT * FROM "Tenant" WHERE slug = $1', [slug]),
    
    findById: (id: string) =>
      queryOne<any>('SELECT * FROM "Tenant" WHERE id = $1', [id]),
    
    findAll: () =>
      query<any>('SELECT * FROM "Tenant" ORDER BY "createdAt" DESC'),
    
    create: (data: { id: string; name: string; slug: string }) =>
      queryOne<any>(
        `INSERT INTO "Tenant" (id, name, slug, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING *`,
        [data.id, data.name, data.slug]
      ),
  },
  
  meetings: {
    findById: (id: string) =>
      queryOne<any>('SELECT * FROM "Meeting" WHERE id = $1', [id]),
    
    findByTenant: (tenantId: string) =>
      query<any>('SELECT * FROM "Meeting" WHERE "tenantId" = $1 ORDER BY "scheduledAt" DESC', [tenantId]),
    
    create: (data: { id: string; title: string; tenantId: string; hostId: string; scheduledAt?: Date }) =>
      queryOne<any>(
        `INSERT INTO "Meeting" (id, title, "tenantId", "hostId", "scheduledAt", status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'scheduled', NOW(), NOW()) RETURNING *`,
        [data.id, data.title, data.tenantId, data.hostId, data.scheduledAt || new Date()]
      ),
  },
  
  events: {
    findById: (id: string) =>
      queryOne<any>('SELECT * FROM "Event" WHERE id = $1', [id]),
    
    findPublic: () =>
      query<any>('SELECT * FROM "Event" WHERE "isPublic" = true AND "startsAt" > NOW() ORDER BY "startsAt" ASC'),
    
    findByTenant: (tenantId: string) =>
      query<any>('SELECT * FROM "Event" WHERE "tenantId" = $1 ORDER BY "startsAt" DESC', [tenantId]),
  },
}
