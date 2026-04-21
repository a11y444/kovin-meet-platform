"use client"

import Link from "next/link"
import { Video, Users, Calendar, Ticket, Clock, TrendingUp, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data
const stats = [
  { name: "Total Meetings", value: "234", change: "+12%", icon: Video },
  { name: "Active Users", value: "45", change: "+5%", icon: Users },
  { name: "Upcoming Events", value: "8", change: "+2", icon: Calendar },
  { name: "Tickets Sold", value: "156", change: "+23%", icon: Ticket },
]

const upcomingMeetings = [
  { id: "1", title: "Team Standup", time: "10:00 AM", attendees: 8, status: "scheduled" },
  { id: "2", title: "Product Review", time: "2:00 PM", attendees: 12, status: "scheduled" },
  { id: "3", title: "Client Call", time: "4:30 PM", attendees: 4, status: "scheduled" },
]

const recentMeetings = [
  { id: "1", title: "Weekly Sync", duration: "45 min", attendees: 6, date: "Today" },
  { id: "2", title: "Design Review", duration: "1h 20m", attendees: 5, date: "Yesterday" },
  { id: "3", title: "Sprint Planning", duration: "2h", attendees: 10, date: "Yesterday" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here is an overview of your workspace.
          </p>
        </div>
        <Link href="/meeting/new">
          <Button className="gap-2">
            <Video className="w-4 h-4" />
            Start Meeting
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Meetings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Scheduled for today</CardDescription>
            </div>
            <Link href="/admin/meetings">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {meeting.time}
                        <span>•</span>
                        <Users className="w-3 h-3" />
                        {meeting.attendees} attendees
                      </div>
                    </div>
                  </div>
                  <Link href={`/meeting/${meeting.id}`}>
                    <Button size="sm" className="gap-1">
                      <Play className="w-3 h-3" />
                      Join
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Meetings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Meetings</CardTitle>
              <CardDescription>Your meeting history</CardDescription>
            </div>
            <Link href="/admin/recordings">
              <Button variant="outline" size="sm">Recordings</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Video className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{meeting.duration}</span>
                        <span>•</span>
                        <span>{meeting.attendees} attendees</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{meeting.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/meeting/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">New Meeting</h3>
              <p className="text-sm text-muted-foreground mt-1">Start an instant meeting</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/meetings/schedule">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Schedule</h3>
              <p className="text-sm text-muted-foreground mt-1">Plan a future meeting</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/events/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Create Event</h3>
              <p className="text-sm text-muted-foreground mt-1">Host a ticketed event</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/users/invite">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Invite Users</h3>
              <p className="text-sm text-muted-foreground mt-1">Add team members</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
