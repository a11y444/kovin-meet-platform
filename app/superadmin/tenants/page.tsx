"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - will be replaced with real API calls
const tenants = [
  { 
    id: "1", 
    name: "Acme Corporation", 
    slug: "acme", 
    domain: "meet.acme.com",
    users: 45, 
    meetings: 234,
    status: "active", 
    plan: "enterprise",
    primaryColor: "#0066FF",
    createdAt: "2024-01-15"
  },
  { 
    id: "2", 
    name: "TechStart Inc", 
    slug: "techstart", 
    domain: null,
    users: 12, 
    meetings: 56,
    status: "active", 
    plan: "pro",
    primaryColor: "#10B981",
    createdAt: "2024-02-20"
  },
  { 
    id: "3", 
    name: "Global Media", 
    slug: "globalmedia", 
    domain: "video.globalmedia.org",
    users: 89, 
    meetings: 567,
    status: "active", 
    plan: "enterprise",
    primaryColor: "#8B5CF6",
    createdAt: "2024-01-08"
  },
  { 
    id: "4", 
    name: "Innovation Labs", 
    slug: "innovlabs", 
    domain: null,
    users: 23, 
    meetings: 78,
    status: "trial", 
    plan: "starter",
    primaryColor: "#F59E0B",
    createdAt: "2024-03-01"
  },
  { 
    id: "5", 
    name: "Education First", 
    slug: "edufirst", 
    domain: "meetings.edufirst.edu",
    users: 156, 
    meetings: 890,
    status: "active", 
    plan: "enterprise",
    primaryColor: "#EF4444",
    createdAt: "2023-11-10"
  },
]

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">
            Manage organizations and their white-label settings
          </p>
        </div>
        <Link href="/superadmin/tenants/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Tenant
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Plans</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>{filteredTenants.length} organizations found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Domain</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Meetings</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${tenant.primaryColor}20` }}
                        >
                          <Building2 className="w-4 h-4" style={{ color: tenant.primaryColor }} />
                        </div>
                        <div>
                          <span className="font-medium block">{tenant.name}</span>
                          <span className="text-xs text-muted-foreground">{tenant.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {tenant.domain ? (
                        <a 
                          href={`https://${tenant.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent hover:underline"
                        >
                          {tenant.domain}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Not configured</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{tenant.users}</td>
                    <td className="py-3 px-4 text-sm">{tenant.meetings}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        tenant.status === "active" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/tenants/${tenant.id}`} className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/superadmin/tenants/${tenant.id}/edit`} className="flex items-center gap-2">
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
