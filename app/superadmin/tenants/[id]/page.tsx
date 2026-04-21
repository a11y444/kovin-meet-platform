"use client"

import { use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Video, 
  Calendar,
  Pencil,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data - will be replaced with real API call
const getTenant = (id: string) => ({
  id,
  name: "Acme Corporation",
  slug: "acme",
  domain: "meet.acme.com",
  logoUrl: null,
  primaryColor: "#0066FF",
  secondaryColor: "#1A1A2E",
  accentColor: "#00D4AA",
  billingEmail: "billing@acme.com",
  contactEmail: "contact@acme.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business St, San Francisco, CA 94105",
  plan: "enterprise",
  maxUsers: 100,
  maxMeetings: 500,
  maxRecordingHours: 50,
  isActive: true,
  isPaid: true,
  createdAt: "2024-01-15T10:30:00Z",
  stats: {
    users: 45,
    meetings: 234,
    events: 12,
    recordings: 89,
  },
  recentUsers: [
    { id: "1", name: "John Doe", email: "john@acme.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@acme.com", role: "Moderator" },
    { id: "3", name: "Bob Wilson", email: "bob@acme.com", role: "Presenter" },
  ]
})

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const tenant = getTenant(id)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${tenant.primaryColor}20` }}
            >
              <Building2 className="w-6 h-6" style={{ color: tenant.primaryColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <p className="text-muted-foreground">{tenant.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tenant.domain && (
            <a href={`https://${tenant.domain}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Visit Site
              </Button>
            </a>
          )}
          <Link href={`/superadmin/tenants/${id}/edit`}>
            <Button className="gap-2">
              <Pencil className="w-4 h-4" />
              Edit Tenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{tenant.stats.users}</p>
                <p className="text-xs text-muted-foreground">of {tenant.maxUsers} max</p>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meetings</p>
                <p className="text-2xl font-bold">{tenant.stats.meetings}</p>
                <p className="text-xs text-muted-foreground">total held</p>
              </div>
              <Video className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="text-2xl font-bold">{tenant.stats.events}</p>
                <p className="text-xs text-muted-foreground">scheduled</p>
              </div>
              <Calendar className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recordings</p>
                <p className="text-2xl font-bold">{tenant.stats.recordings}</p>
                <p className="text-xs text-muted-foreground">stored</p>
              </div>
              <Video className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant Details */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Details</CardTitle>
            <CardDescription>Organization information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tenant.isActive 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {tenant.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {tenant.plan}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tenant.isPaid 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}>
                {tenant.isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{new Date(tenant.createdAt).toLocaleDateString()}</span>
            </div>
            
            {tenant.domain && (
              <div className="flex items-start gap-3 py-2">
                <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Custom Domain</p>
                  <a 
                    href={`https://${tenant.domain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    {tenant.domain}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Organization contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenant.contactEmail && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Contact Email</p>
                  <a 
                    href={`mailto:${tenant.contactEmail}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {tenant.contactEmail}
                  </a>
                </div>
              </div>
            )}
            {tenant.billingEmail && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Billing Email</p>
                  <a 
                    href={`mailto:${tenant.billingEmail}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {tenant.billingEmail}
                  </a>
                </div>
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                </div>
              </div>
            )}
            {tenant.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{tenant.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branding Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>White-label colors for this tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tenant.primaryColor }}
                />
                <span className="text-xs font-mono">{tenant.primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tenant.secondaryColor }}
                />
                <span className="text-xs font-mono">{tenant.secondaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tenant.accentColor }}
                />
                <span className="text-xs font-mono">{tenant.accentColor}</span>
              </div>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: tenant.secondaryColor }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: tenant.primaryColor }}
                >
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white text-sm">{tenant.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: tenant.primaryColor }}
                >
                  Primary
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{ backgroundColor: tenant.accentColor, color: tenant.secondaryColor }}
                >
                  Accent
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest users in this organization</CardDescription>
            </div>
            <Link href={`/superadmin/users?tenant=${id}`}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tenant.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
