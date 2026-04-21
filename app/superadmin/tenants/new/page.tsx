"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Building2, Palette, Settings, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewTenantPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    domain: "",
    primaryColor: "#0066FF",
    secondaryColor: "#1A1A2E",
    accentColor: "#00D4AA",
    billingEmail: "",
    contactEmail: "",
    phone: "",
    address: "",
    plan: "starter",
    maxUsers: 50,
    maxMeetings: 100,
    maxRecordingHours: 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // TODO: Create tenant via API
    router.push("/superadmin/tenants")
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/superadmin/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Tenant</h1>
          <p className="text-muted-foreground">
            Add a new organization to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Organization details and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value)
                    })
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Acme Corporation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="acme"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Used in URLs: meet.yourdomain.com/{formData.slug || "slug"}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Domain (optional)
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="meet.acme.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Configure a custom domain for this tenant
              </p>
            </div>
          </CardContent>
        </Card>

        {/* White-Label Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              White-Label Branding
            </CardTitle>
            <CardDescription>
              Customize the look and feel for this organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-input"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-input"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-input"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div 
                className="p-4 rounded-lg border"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-white">{formData.name || "Organization Name"}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: formData.accentColor, color: formData.secondaryColor }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Billing and contact details for the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="billing@acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="contact@acme.com"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="123 Business St, City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Plan & Limits
            </CardTitle>
            <CardDescription>
              Set the subscription plan and resource limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Plan
              </label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Users
                </label>
                <input
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Meetings
                </label>
                <input
                  type="number"
                  value={formData.maxMeetings}
                  onChange={(e) => setFormData({ ...formData, maxMeetings: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Recording Hours
                </label>
                <input
                  type="number"
                  value={formData.maxRecordingHours}
                  onChange={(e) => setFormData({ ...formData, maxRecordingHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/superadmin/tenants">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Tenant"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
