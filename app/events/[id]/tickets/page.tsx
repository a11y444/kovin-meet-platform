"use client"

import { useState, use, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, Download, Calendar, MapPin, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import QRCode from "qrcode"

interface Ticket {
  id: string
  ticketNumber: string
  ticketType: string
  attendeeName: string
  attendeeEmail: string
  status: "VALID" | "USED" | "CANCELLED"
  event: {
    title: string
    startDate: string
    location: string
    isVirtual: boolean
  }
}

// Mock tickets
const mockTickets: Ticket[] = [
  {
    id: "1",
    ticketNumber: "TC24-GA-001234",
    ticketType: "General Admission",
    attendeeName: "John Doe",
    attendeeEmail: "john@example.com",
    status: "VALID",
    event: {
      title: "Tech Conference 2024",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "San Francisco Convention Center",
      isVirtual: true,
    },
  },
  {
    id: "2",
    ticketNumber: "TC24-GA-001235",
    ticketType: "General Admission",
    attendeeName: "Jane Doe",
    attendeeEmail: "john@example.com",
    status: "VALID",
    event: {
      title: "Tech Conference 2024",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "San Francisco Convention Center",
      isVirtual: true,
    },
  },
  {
    id: "3",
    ticketNumber: "TC24-VIP-000456",
    ticketType: "VIP Pass",
    attendeeName: "John Doe",
    attendeeEmail: "john@example.com",
    status: "VALID",
    event: {
      title: "Tech Conference 2024",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "San Francisco Convention Center",
      isVirtual: true,
    },
  },
]

export default function TicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tickets] = useState<Ticket[]>(mockTickets)

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/events/${id}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Event
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Tickets</h1>
          <p className="text-muted-foreground mt-1">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} for {tickets[0]?.event.title}
          </p>
        </div>

        <div className="space-y-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Important Information</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Present your QR code at the entrance for check-in</li>
            <li>- Each ticket can only be used once</li>
            <li>- Screenshots of QR codes are accepted</li>
            <li>- For virtual attendance, use the link sent to your email</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrGenerated, setQrGenerated] = useState(false)

  useEffect(() => {
    if (canvasRef.current && !qrGenerated) {
      QRCode.toCanvas(
        canvasRef.current,
        ticket.ticketNumber,
        {
          width: 150,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error)
          else setQrGenerated(true)
        }
      )
    }
  }, [ticket.ticketNumber, qrGenerated])

  const statusColors = {
    VALID: "bg-green-100 text-green-800",
    USED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Ticket details */}
        <CardContent className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className={statusColors[ticket.status]}>
                {ticket.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {ticket.ticketNumber}
              </p>
            </div>
            <Badge variant="outline">{ticket.ticketType}</Badge>
          </div>

          <h3 className="text-xl font-semibold mb-4">{ticket.event.title}</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(ticket.event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{ticket.event.location}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Attendee:</span>{" "}
              <span className="font-medium">{ticket.attendeeName}</span>
            </p>
            <p className="text-sm text-muted-foreground">{ticket.attendeeEmail}</p>
          </div>
        </CardContent>

        {/* Right side - QR Code */}
        <div className="border-t md:border-t-0 md:border-l border-border border-dashed">
          <div className="p-6 flex flex-col items-center justify-center h-full bg-muted/30">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <canvas ref={canvasRef} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Scan to check in</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
