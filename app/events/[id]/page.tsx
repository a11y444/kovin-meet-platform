"use client"

import { useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Clock, Share2, Heart, ChevronLeft, Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  available: number
  maxPerOrder: number
  features: string[]
}

interface Event {
  id: string
  title: string
  description: string
  longDescription: string
  startDate: string
  endDate: string
  location: string
  address: string
  isVirtual: boolean
  coverImage: string | null
  category: string
  organizer: {
    name: string
    logo: string | null
  }
  ticketTypes: TicketType[]
  _count: {
    tickets: number
  }
}

// Mock event data
const mockEvent: Event = {
  id: "1",
  title: "Tech Conference 2024",
  description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
  longDescription: `
    Join us for the biggest tech conference of the year! This three-day event brings together industry leaders, innovative startups, and tech enthusiasts from around the world.

    **What to Expect:**
    - Keynote speeches from industry pioneers
    - Hands-on workshops and tutorials
    - Networking opportunities with thousands of professionals
    - Exhibition hall featuring the latest tech innovations
    - After-parties and social events

    **Featured Topics:**
    - Artificial Intelligence and Machine Learning
    - Cloud Computing and DevOps
    - Cybersecurity Best Practices
    - Product Design and UX
    - Startup Growth Strategies

    Whether you're a seasoned professional or just starting your tech journey, this conference has something for everyone. Don't miss this opportunity to learn, connect, and grow!
  `,
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
  location: "San Francisco Convention Center",
  address: "747 Howard St, San Francisco, CA 94103",
  isVirtual: true,
  coverImage: null,
  category: "Technology",
  organizer: {
    name: "TechEvents Inc.",
    logo: null,
  },
  ticketTypes: [
    {
      id: "1",
      name: "General Admission",
      description: "Access to all conference sessions and exhibition hall",
      price: 99,
      available: 500,
      maxPerOrder: 5,
      features: [
        "All conference sessions",
        "Exhibition hall access",
        "Conference materials",
        "Lunch included",
      ],
    },
    {
      id: "2",
      name: "VIP Pass",
      description: "Premium experience with exclusive perks",
      price: 299,
      available: 50,
      maxPerOrder: 2,
      features: [
        "Everything in General Admission",
        "VIP networking lounge",
        "Priority seating",
        "Meet & greet with speakers",
        "Exclusive dinner event",
        "Premium swag bag",
      ],
    },
    {
      id: "3",
      name: "Virtual Attendee",
      description: "Join remotely with full streaming access",
      price: 49,
      available: 1000,
      maxPerOrder: 10,
      features: [
        "Live streaming of all sessions",
        "On-demand replay access",
        "Virtual networking rooms",
        "Digital conference materials",
      ],
    },
  ],
  _count: { tickets: 234 },
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event] = useState<Event>(mockEvent)
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const updateTicketQuantity = (ticketId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0
      const ticket = event.ticketTypes.find((t) => t.id === ticketId)
      if (!ticket) return prev
      const newQuantity = Math.max(0, Math.min(current + delta, ticket.maxPerOrder, ticket.available))
      if (newQuantity === 0) {
        const { [ticketId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [ticketId]: newQuantity }
    })
  }

  const totalAmount = Object.entries(selectedTickets).reduce((sum, [ticketId, quantity]) => {
    const ticket = event.ticketTypes.find((t) => t.id === ticketId)
    return sum + (ticket?.price || 0) * quantity
  }, 0)

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    // Simulate checkout - in production this would redirect to Stripe
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Redirect to checkout page
    window.location.href = `/events/${id}/checkout?tickets=${encodeURIComponent(JSON.stringify(selectedTickets))}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-muted">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-4 left-4">
          <Link href="/events">
            <Button variant="secondary" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    <Badge>{event.category}</Badge>
                    {event.isVirtual && (
                      <Badge variant="secondary">Virtual Available</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{event.description}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="text-sm text-muted-foreground">{event.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line">
                  {event.longDescription}
                </div>
              </CardContent>
            </Card>

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {event.organizer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Select Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ticket.description}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {ticket.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        {ticket.available} available
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateTicketQuantity(ticket.id, -1)}
                          disabled={!selectedTickets[ticket.id]}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {selectedTickets[ticket.id] || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateTicketQuantity(ticket.id, 1)}
                          disabled={
                            (selectedTickets[ticket.id] || 0) >= ticket.maxPerOrder ||
                            (selectedTickets[ticket.id] || 0) >= ticket.available
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tickets selected</span>
                    <span>{totalTickets}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={totalTickets === 0 || isCheckingOut}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our terms of service and privacy policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
