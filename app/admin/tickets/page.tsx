"use client"

import { useState } from "react"
import { 
  Ticket, 
  QrCode, 
  Check, 
  X, 
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  Eye,
  MoreHorizontal,
  Download
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock tickets data
const mockTickets = [
  {
    id: "tkt_1",
    code: "KOVIN-2024-ABC123",
    eventTitle: "Tech Conference 2024",
    attendeeName: "Alice Johnson",
    attendeeEmail: "alice@example.com",
    ticketType: "VIP",
    price: 299,
    purchasedAt: "2024-01-10T09:30:00Z",
    status: "valid",
    checkedIn: false,
  },
  {
    id: "tkt_2",
    code: "KOVIN-2024-DEF456",
    eventTitle: "Tech Conference 2024",
    attendeeName: "Bob Smith",
    attendeeEmail: "bob@example.com",
    ticketType: "Standard",
    price: 149,
    purchasedAt: "2024-01-11T14:20:00Z",
    status: "used",
    checkedIn: true,
    checkedInAt: "2024-01-15T08:45:00Z",
  },
  {
    id: "tkt_3",
    code: "KOVIN-2024-GHI789",
    eventTitle: "Product Launch Webinar",
    attendeeName: "Carol Davis",
    attendeeEmail: "carol@example.com",
    ticketType: "Free",
    price: 0,
    purchasedAt: "2024-01-12T11:00:00Z",
    status: "valid",
    checkedIn: false,
  },
  {
    id: "tkt_4",
    code: "KOVIN-2024-JKL012",
    eventTitle: "Developer Workshop",
    attendeeName: "David Lee",
    attendeeEmail: "david@example.com",
    ticketType: "Early Bird",
    price: 79,
    purchasedAt: "2024-01-08T16:45:00Z",
    status: "cancelled",
    checkedIn: false,
  },
  {
    id: "tkt_5",
    code: "KOVIN-2024-MNO345",
    eventTitle: "Tech Conference 2024",
    attendeeName: "Eva Martinez",
    attendeeEmail: "eva@example.com",
    ticketType: "VIP",
    price: 299,
    purchasedAt: "2024-01-13T10:15:00Z",
    status: "valid",
    checkedIn: false,
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCurrency(amount: number): string {
  if (amount === 0) return "Free"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch = 
      ticket.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = mockTickets
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.price, 0)
  const validCount = mockTickets.filter((t) => t.status === "valid").length
  const usedCount = mockTickets.filter((t) => t.status === "used").length
  const cancelledCount = mockTickets.filter((t) => t.status === "cancelled").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Valid</Badge>
      case "used":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Used</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground">
          Manage event tickets and check-ins
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <QrCode className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Tickets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-sm">
                  {ticket.code}
                </TableCell>
                <TableCell className="font-medium">
                  {ticket.eventTitle}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {ticket.attendeeName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.attendeeEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.ticketType}</Badge>
                </TableCell>
                <TableCell>{formatCurrency(ticket.price)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(ticket.purchasedAt)}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setIsDetailOpen(true)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={ticket.status !== "valid"}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Check In
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={ticket.status === "cancelled"}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Ticket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-lg font-bold">{selectedTicket.code}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan QR code to validate
                </p>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{selectedTicket.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendee</span>
                  <span className="font-medium">{selectedTicket.attendeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedTicket.attendeeEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Type</span>
                  <Badge variant="outline">{selectedTicket.ticketType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{formatCurrency(selectedTicket.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchased</span>
                  <span className="text-sm">{formatDate(selectedTicket.purchasedAt)}</span>
                </div>
                {selectedTicket.checkedIn && selectedTicket.checkedInAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked In</span>
                    <span className="text-sm">{formatDate(selectedTicket.checkedInAt)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  disabled={selectedTicket.status !== "valid"}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Check In
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
