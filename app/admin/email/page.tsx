"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Mail, 
  Plus, 
  Search, 
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Send,
  Clock,
  CheckCircle2,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Mock data
const campaigns = [
  { 
    id: "1", 
    name: "Welcome Series", 
    subject: "Welcome to KOVIN Meet!",
    status: "sent",
    recipients: 156,
    sent: 156,
    opened: 89,
    clicked: 45,
    sentAt: "2024-03-10T10:00:00"
  },
  { 
    id: "2", 
    name: "Event Announcement", 
    subject: "Join us for Tech Conference 2024",
    status: "sent",
    recipients: 500,
    sent: 498,
    opened: 312,
    clicked: 156,
    sentAt: "2024-03-08T14:00:00"
  },
  { 
    id: "3", 
    name: "Monthly Newsletter", 
    subject: "March Updates & Tips",
    status: "scheduled",
    recipients: 450,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledAt: "2024-03-20T09:00:00"
  },
  { 
    id: "4", 
    name: "Feature Launch", 
    subject: "New: Recording & Transcription",
    status: "draft",
    recipients: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
  },
]

const templates = [
  { id: "1", name: "Welcome Email", type: "welcome", lastUsed: "2024-03-10" },
  { id: "2", name: "Meeting Invite", type: "meeting_invite", lastUsed: "2024-03-14" },
  { id: "3", name: "Event Ticket", type: "event_ticket", lastUsed: "2024-03-12" },
  { id: "4", name: "Meeting Reminder", type: "meeting_reminder", lastUsed: "2024-03-15" },
  { id: "5", name: "Password Reset", type: "password_reset", lastUsed: "2024-03-13" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "sent":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "draft":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    case "sending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function EmailPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0)
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Email</h1>
          <p className="text-muted-foreground">
            Manage email campaigns and templates
          </p>
        </div>
        <Link href="/admin/email/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Mail className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{totalSent}</p>
              </div>
              <Send className="w-10 h-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{avgOpenRate}%</p>
              </div>
              <Eye className="w-10 h-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === "scheduled").length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4 mt-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns table */}
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>{filteredCampaigns.length} campaigns found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recipients</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Open Rate</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Click Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => {
                      const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0
                      const clickRate = campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0
                      
                      return (
                        <tr key={campaign.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium block">{campaign.name}</span>
                              <span className="text-xs text-muted-foreground">{campaign.subject}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {campaign.recipients > 0 ? campaign.recipients : "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {campaign.status === "sent" ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-muted rounded-full">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${openRate}%` }}
                                  />
                                </div>
                                <span className="text-sm">{openRate}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {campaign.status === "sent" ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-muted rounded-full">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${clickRate}%` }}
                                  />
                                </div>
                                <span className="text-sm">{clickRate}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  View
                                </DropdownMenuItem>
                                {campaign.status === "draft" && (
                                  <>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                      <Pencil className="w-4 h-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                      <Send className="w-4 h-4" />
                                      Send Now
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem className="text-destructive flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage your email templates</CardDescription>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Pencil className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last used: {new Date(template.lastUsed).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 mt-3">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
