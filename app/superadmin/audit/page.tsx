"use client"

import { useState } from "react"
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock audit log data
const mockLogs = [
  {
    id: "log_1",
    timestamp: "2024-01-15T14:32:15Z",
    actor: "superadmin@kovin.io",
    actorType: "superadmin",
    action: "tenant.created",
    resource: "Tenant: Acme Corp",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    status: "success",
    details: { tenantId: "tenant_123", plan: "enterprise" },
  },
  {
    id: "log_2",
    timestamp: "2024-01-15T14:28:00Z",
    actor: "admin@acme.com",
    actorType: "admin",
    action: "user.invited",
    resource: "User: john@acme.com",
    ipAddress: "10.0.0.50",
    userAgent: "Mozilla/5.0...",
    status: "success",
    details: { userId: "user_456", role: "member" },
  },
  {
    id: "log_3",
    timestamp: "2024-01-15T14:15:30Z",
    actor: "superadmin@kovin.io",
    actorType: "superadmin",
    action: "settings.updated",
    resource: "Platform Settings",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    status: "success",
    details: { changes: ["smtp_host", "smtp_port"] },
  },
  {
    id: "log_4",
    timestamp: "2024-01-15T13:45:00Z",
    actor: "unknown",
    actorType: "system",
    action: "auth.failed",
    resource: "Login Attempt",
    ipAddress: "203.0.113.42",
    userAgent: "curl/7.64.1",
    status: "failure",
    details: { reason: "invalid_credentials", attempts: 3 },
  },
  {
    id: "log_5",
    timestamp: "2024-01-15T13:30:00Z",
    actor: "admin@techcorp.io",
    actorType: "admin",
    action: "meeting.created",
    resource: "Meeting: Weekly Standup",
    ipAddress: "172.16.0.25",
    userAgent: "Mozilla/5.0...",
    status: "success",
    details: { meetingId: "meet_789", scheduled: "2024-01-16T09:00:00Z" },
  },
  {
    id: "log_6",
    timestamp: "2024-01-15T12:00:00Z",
    actor: "system",
    actorType: "system",
    action: "backup.completed",
    resource: "Database Backup",
    ipAddress: "127.0.0.1",
    userAgent: "KOVIN Backup Service",
    status: "success",
    details: { size: "2.4GB", duration: "45s" },
  },
  {
    id: "log_7",
    timestamp: "2024-01-15T11:30:00Z",
    actor: "superadmin@kovin.io",
    actorType: "superadmin",
    action: "tenant.suspended",
    resource: "Tenant: Bad Actor Inc",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    status: "success",
    details: { reason: "terms_violation", tenantId: "tenant_bad" },
  },
  {
    id: "log_8",
    timestamp: "2024-01-15T10:15:00Z",
    actor: "admin@startup.io",
    actorType: "admin",
    action: "event.published",
    resource: "Event: Product Launch",
    ipAddress: "10.10.10.10",
    userAgent: "Mozilla/5.0...",
    status: "success",
    details: { eventId: "evt_321", tickets: 500 },
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    "tenant.created": "Tenant Created",
    "tenant.updated": "Tenant Updated",
    "tenant.suspended": "Tenant Suspended",
    "tenant.deleted": "Tenant Deleted",
    "user.created": "User Created",
    "user.invited": "User Invited",
    "user.updated": "User Updated",
    "user.deleted": "User Deleted",
    "meeting.created": "Meeting Created",
    "meeting.started": "Meeting Started",
    "meeting.ended": "Meeting Ended",
    "event.created": "Event Created",
    "event.published": "Event Published",
    "settings.updated": "Settings Updated",
    "auth.login": "User Login",
    "auth.logout": "User Logout",
    "auth.failed": "Auth Failed",
    "backup.completed": "Backup Completed",
  }
  return labels[action] || action
}

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "failure":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

function getActorBadge(actorType: string) {
  switch (actorType) {
    case "superadmin":
      return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Superadmin</Badge>
    case "admin":
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Admin</Badge>
    case "user":
      return <Badge variant="secondary">User</Badge>
    case "system":
      return <Badge variant="outline">System</Badge>
    default:
      return <Badge variant="secondary">{actorType}</Badge>
  }
}

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actorFilter, setActorFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesActor = actorFilter === "all" || log.actorType === actorFilter
    const matchesAction = actionFilter === "all" || log.action.startsWith(actionFilter)
    return matchesSearch && matchesActor && matchesAction
  })

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system and user activities
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLogs.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLogs.filter((l) => l.status === "success").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLogs.filter((l) => l.status === "failure").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLogs.filter((l) => l.actorType === "system").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actorFilter} onValueChange={setActorFilter}>
          <SelectTrigger className="w-[150px]">
            <User className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Actor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actors</SelectItem>
            <SelectItem value="superadmin">Superadmin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{getStatusIcon(log.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{log.actor}</div>
                    {getActorBadge(log.actorType)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getActionLabel(log.action)}</Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {log.resource}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {log.ipAddress}
                  </code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * logsPerPage + 1} to{" "}
            {Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
            {filteredLogs.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
