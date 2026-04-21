import { Building2, Users, Video, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Mock data - will be replaced with real data from Prisma
const stats = [
  { name: "Total Tenants", value: "12", change: "+2", icon: Building2, href: "/superadmin/tenants" },
  { name: "Total Users", value: "1,234", change: "+56", icon: Users, href: "/superadmin/users" },
  { name: "Active Meetings", value: "23", change: "+5", icon: Video, href: "/superadmin/activity" },
  { name: "Events This Month", value: "89", change: "+12", icon: Activity, href: "/superadmin/activity" },
]

const recentTenants = [
  { id: "1", name: "Acme Corporation", slug: "acme", users: 45, status: "active", plan: "enterprise" },
  { id: "2", name: "TechStart Inc", slug: "techstart", users: 12, status: "active", plan: "pro" },
  { id: "3", name: "Global Media", slug: "globalmedia", users: 89, status: "active", plan: "enterprise" },
  { id: "4", name: "Innovation Labs", slug: "innovlabs", users: 23, status: "trial", plan: "starter" },
]

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all tenants and platform activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} this month</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tenants</CardTitle>
            <CardDescription>Latest organizations on the platform</CardDescription>
          </div>
          <Link href="/superadmin/tenants">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Slug</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-accent" />
                        </div>
                        <span className="font-medium">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{tenant.slug}</td>
                    <td className="py-3 px-4 text-sm">{tenant.users}</td>
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
                      <Link href={`/superadmin/tenants/${tenant.id}`}>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <Building2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Create New Tenant</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a new organization to the platform
            </p>
            <Link href="/superadmin/tenants/new">
              <Button size="sm">Create Tenant</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Manage Users</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage all platform users
            </p>
            <Link href="/superadmin/users">
              <Button size="sm" variant="outline">View Users</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <Activity className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">View Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor platform-wide activity and logs
            </p>
            <Link href="/superadmin/activity">
              <Button size="sm" variant="outline">View Logs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
