"use client"

import { 
  Video, 
  Users, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for charts
const meetingData = [
  { name: "Mon", meetings: 12, attendees: 45 },
  { name: "Tue", meetings: 15, attendees: 62 },
  { name: "Wed", meetings: 18, attendees: 78 },
  { name: "Thu", meetings: 14, attendees: 55 },
  { name: "Fri", meetings: 20, attendees: 89 },
  { name: "Sat", meetings: 5, attendees: 18 },
  { name: "Sun", meetings: 3, attendees: 12 },
]

const topHosts = [
  { name: "John Doe", meetings: 45, hours: 67 },
  { name: "Jane Smith", meetings: 38, hours: 52 },
  { name: "Bob Wilson", meetings: 32, hours: 41 },
  { name: "Alice Brown", meetings: 28, hours: 35 },
  { name: "Charlie Davis", meetings: 24, hours: 30 },
]

const meetingTypes = [
  { name: "Team Meetings", value: 45, color: "bg-primary" },
  { name: "Client Calls", value: 28, color: "bg-blue-500" },
  { name: "Webinars", value: 15, color: "bg-green-500" },
  { name: "One-on-Ones", value: 12, color: "bg-yellow-500" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your meeting activity
          </p>
        </div>
        <Select defaultValue="7d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Meetings</p>
                <p className="text-2xl font-bold">234</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last week
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold">1,892</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% from last week
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">456</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% from last week
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-2xl font-bold">47 min</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per meeting
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meeting Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Activity</CardTitle>
            <CardDescription>Meetings and attendees per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2">
              {meetingData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-primary/20 rounded-t"
                      style={{ height: `${(day.attendees / 100) * 200}px` }}
                    />
                    <div 
                      className="w-3/4 bg-primary rounded-t -mt-1"
                      style={{ height: `${(day.meetings / 25) * 100}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{day.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-primary" />
                Meetings
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-primary/20" />
                Attendees
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Types */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Types</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetingTypes.map((type) => (
                <div key={type.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="text-sm text-muted-foreground">{type.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div 
                      className={`h-full rounded-full ${type.color}`}
                      style={{ width: `${type.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pie chart visualization */}
            <div className="flex items-center justify-center mt-8">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    let cumulative = 0
                    return meetingTypes.map((type, index) => {
                      const dasharray = `${type.value} ${100 - type.value}`
                      const offset = -cumulative
                      cumulative += type.value
                      const colors = ["stroke-primary", "stroke-blue-500", "stroke-green-500", "stroke-yellow-500"]
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          strokeWidth="20"
                          strokeDasharray={dasharray}
                          strokeDashoffset={offset}
                          className={colors[index]}
                        />
                      )
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-6 h-6 mx-auto text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Hosts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Meeting Hosts</CardTitle>
            <CardDescription>Most active users this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Host</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Meetings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {topHosts.map((host, index) => (
                    <tr key={host.name} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-100 text-gray-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {host.name[0]}
                            </span>
                          </div>
                          <span className="font-medium">{host.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{host.meetings}</td>
                      <td className="py-3 px-4 text-sm">{host.hours}h</td>
                      <td className="py-3 px-4">
                        <div className="w-full max-w-[200px] h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(host.meetings / topHosts[0].meetings) * 100}%` }}
                          />
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
    </div>
  )
}
