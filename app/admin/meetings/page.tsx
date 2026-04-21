"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Video, 
  Plus, 
  Search, 
  MoreVertical,
  Play,
  Calendar,
  Copy,
  Trash2,
  Users,
  Clock
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
const meetings = [
  { 
    id: "1", 
    title: "Team Standup", 
    roomCode: "ABC-123-XYZ",
    status: "scheduled",
    scheduledStart: "2024-03-15T10:00:00",
    duration: 30,
    host: "John Doe",
    attendees: 8
  },
  { 
    id: "2", 
    title: "Product Review", 
    roomCode: "DEF-456-UVW",
    status: "live",
    scheduledStart: "2024-03-15T14:00:00",
    duration: 60,
    host: "Jane Smith",
    attendees: 12
  },
  { 
    id: "3", 
    title: "Client Presentation", 
    roomCode: "GHI-789-RST",
    status: "scheduled",
    scheduledStart: "2024-03-15T16:30:00",
    duration: 45,
    host: "Bob Wilson",
    attendees: 4
  },
  { 
    id: "4", 
    title: "Sprint Retrospective", 
    roomCode: "JKL-012-OPQ",
    status: "ended",
    scheduledStart: "2024-03-14T11:00:00",
    duration: 60,
    host: "Alice Brown",
    attendees: 10
  },
  { 
    id: "5", 
    title: "Design Workshop", 
    roomCode: "MNO-345-LMN",
    status: "ended",
    scheduledStart: "2024-03-14T15:00:00",
    duration: 120,
    host: "Charlie Davis",
    attendees: 6
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "live":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "ended":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.roomCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">
            Manage and schedule video meetings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/meetings/schedule">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </Link>
          <Link href="/meeting/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Start Meeting
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Now</p>
                <p className="text-2xl font-bold">
                  {meetings.filter(m => m.status === "live").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {meetings.filter(m => m.status === "scheduled").length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total This Week</p>
                <p className="text-2xl font-bold">{meetings.length}</p>
              </div>
              <Video className="w-10 h-10 text-primary/20" />
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
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Status</option>
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Meetings table */}
      <Card>
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
          <CardDescription>{filteredMeetings.length} meetings found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Meeting</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Host</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Attendees</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium block">{meeting.title}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(meeting.scheduledStart).toLocaleString()}
                            <span>({meeting.duration} min)</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => copyRoomCode(meeting.roomCode)}
                        className="flex items-center gap-1 text-sm font-mono hover:text-primary transition-colors"
                      >
                        {meeting.roomCode}
                        <Copy className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm">{meeting.host}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(meeting.status)}`}>
                        {meeting.status === "live" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                        )}
                        {meeting.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {meeting.attendees}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {meeting.status !== "ended" && (
                          <Link href={`/meeting/${meeting.id}`}>
                            <Button size="sm" variant={meeting.status === "live" ? "default" : "outline"} className="gap-1">
                              <Play className="w-3 h-3" />
                              {meeting.status === "live" ? "Join" : "Start"}
                            </Button>
                          </Link>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="flex items-center gap-2"
                              onClick={() => copyRoomCode(meeting.roomCode)}
                            >
                              <Copy className="w-4 h-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
