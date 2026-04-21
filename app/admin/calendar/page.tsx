"use client"

import { useState } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Video,
  Ticket,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Mock events data
const calendarEvents = [
  { id: "1", title: "Team Standup", type: "meeting", date: "2024-03-15", time: "10:00", duration: 30 },
  { id: "2", title: "Product Review", type: "meeting", date: "2024-03-15", time: "14:00", duration: 60 },
  { id: "3", title: "Tech Conference", type: "event", date: "2024-03-20", time: "09:00", duration: 480 },
  { id: "4", title: "Client Call", type: "meeting", date: "2024-03-18", time: "16:30", duration: 45 },
  { id: "5", title: "Webinar", type: "event", date: "2024-03-22", time: "14:00", duration: 120 },
]

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getEventsForDate = (dateKey: string) => {
    return calendarEvents.filter(e => e.date === dateKey)
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Generate calendar days
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>{monthNames[month]} {year}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dateKey = day ? formatDateKey(day) : ""
                const events = day ? getEventsForDate(dateKey) : []
                const isToday = day && 
                  new Date().getDate() === day && 
                  new Date().getMonth() === month && 
                  new Date().getFullYear() === year
                const isSelected = selectedDate === dateKey

                return (
                  <button
                    key={index}
                    disabled={!day}
                    onClick={() => day && setSelectedDate(dateKey)}
                    className={cn(
                      "aspect-square p-1 rounded-lg text-sm relative transition-colors",
                      day ? "hover:bg-muted" : "cursor-default",
                      isToday && "bg-primary/10",
                      isSelected && "ring-2 ring-primary"
                    )}
                  >
                    {day && (
                      <>
                        <span className={cn(
                          "font-medium",
                          isToday && "text-primary"
                        )}>
                          {day}
                        </span>
                        {events.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {events.slice(0, 3).map((e, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  e.type === "meeting" ? "bg-primary" : "bg-green-500"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Meetings
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Events
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected day events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate 
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { 
                    weekday: "long", 
                    month: "long", 
                    day: "numeric" 
                  })
                : "Select a Day"}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 && "s"} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div 
                      key={event.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4",
                        event.type === "meeting" 
                          ? "bg-primary/5 border-primary" 
                          : "bg-green-500/5 border-green-500"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                            <span>({event.duration} min)</span>
                          </div>
                        </div>
                        {event.type === "meeting" ? (
                          <Video className="w-4 h-4 text-primary" />
                        ) : (
                          <Ticket className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events scheduled</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Add Event
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Click on a day to see events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
