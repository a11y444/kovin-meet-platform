"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Search, Filter, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isVirtual: boolean
  coverImage: string | null
  category: string
  ticketTypes: {
    id: string
    name: string
    price: number
    available: number
  }[]
  _count: {
    tickets: number
  }
}

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    location: "San Francisco Convention Center",
    isVirtual: true,
    coverImage: null,
    category: "Technology",
    ticketTypes: [
      { id: "1", name: "General Admission", price: 99, available: 500 },
      { id: "2", name: "VIP Pass", price: 299, available: 50 },
    ],
    _count: { tickets: 234 },
  },
  {
    id: "2",
    title: "Design Systems Workshop",
    description: "A hands-on workshop covering modern design systems, component libraries, and design tokens.",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Online",
    isVirtual: true,
    coverImage: null,
    category: "Design",
    ticketTypes: [
      { id: "3", name: "Standard", price: 49, available: 100 },
    ],
    _count: { tickets: 67 },
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    description: "Watch promising startups pitch their ideas to top investors and network with founders.",
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: "New York City",
    isVirtual: false,
    coverImage: null,
    category: "Business",
    ticketTypes: [
      { id: "4", name: "Attendee", price: 25, available: 200 },
      { id: "5", name: "Founder", price: 0, available: 20 },
    ],
    _count: { tickets: 156 },
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
    const matchesType = typeFilter === "all" ||
      (typeFilter === "virtual" && event.isVirtual) ||
      (typeFilter === "in-person" && !event.isVirtual)
    return matchesSearch && matchesCategory && matchesType
  })

  const categories = [...new Set(events.map((e) => e.category))]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Upcoming Events</h1>
              <p className="text-muted-foreground mt-1">
                Discover and attend amazing events
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const lowestPrice = Math.min(...event.ticketTypes.map((t) => t.price))
  const hasAvailableTickets = event.ticketTypes.some((t) => t.available > 0)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl font-bold text-primary/30">
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90">
            {event.category}
          </Badge>
          {event.isVirtual && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
              Virtual
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event._count.tickets} registered</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          {lowestPrice === 0 ? (
            <span className="text-lg font-semibold text-green-600">Free</span>
          ) : (
            <span className="text-lg font-semibold">
              From ${lowestPrice}
            </span>
          )}
        </div>
        <Link href={`/events/${event.id}`}>
          <Button disabled={!hasAvailableTickets}>
            {hasAvailableTickets ? "Get Tickets" : "Sold Out"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
