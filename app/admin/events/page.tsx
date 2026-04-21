"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Ticket, 
  Plus, 
  Search, 
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Users,
  DollarSign,
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

// Mock data
const events = [
  { 
    id: "1", 
    title: "Tech Conference 2024", 
    slug: "tech-conference-2024",
    status: "published",
    startDate: "2024-04-15T09:00:00",
    endDate: "2024-04-15T18:00:00",
    ticketsSold: 156,
    maxAttendees: 500,
    revenue: 15600,
    isOnline: true
  },
  { 
    id: "2", 
    title: "Product Launch Webinar", 
    slug: "product-launch-webinar",
    status: "published",
    startDate: "2024-03-20T14:00:00",
    endDate: "2024-03-20T16:00:00",
    ticketsSold: 89,
    maxAttendees: 200,
    revenue: 0,
    isOnline: true
  },
  { 
    id: "3", 
    title: "Leadership Workshop", 
    slug: "leadership-workshop",
    status: "draft",
    startDate: "2024-05-10T10:00:00",
    endDate: "2024-05-10T17:00:00",
    ticketsSold: 0,
    maxAttendees: 50,
    revenue: 0,
    isOnline: false
  },
  { 
    id: "4", 
    title: "Annual Meetup", 
    slug: "annual-meetup",
    status: "completed",
    startDate: "2024-02-28T09:00:00",
    endDate: "2024-02-28T20:00:00",
    ticketsSold: 234,
    maxAttendees: 300,
    revenue: 23400,
    isOnline: false
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "draft":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "completed":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0)
  const totalTickets = events.reduce((sum, e) => sum + e.ticketsSold, 0)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage events and ticket sales
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.status === "published").length}
                </p>
              </div>
              <Ticket className="w-10 h-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold">{totalTickets}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Events grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.startDate).toLocaleDateString()}
                    {event.isOnline ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Online
                      </span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                        In-Person
                      </span>
                    )}
                  </CardDescription>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tickets</p>
                  <p className="font-semibold">{event.ticketsSold}/{event.maxAttendees}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-semibold">${event.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <div className="w-full h-2 bg-muted rounded-full mt-1">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(event.ticketsSold / event.maxAttendees) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Link href={`/events/${event.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    View Page
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/events/${event.id}`} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/events/${event.id}/edit`} className="flex items-center gap-2">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
