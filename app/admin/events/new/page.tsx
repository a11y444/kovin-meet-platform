"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Image as ImageIcon,
  Plus,
  Trash2,
  Globe,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TicketTier {
  id: string
  name: string
  price: number
  quantity: number
  description: string
}

export default function NewEventPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [locationType, setLocationType] = useState<"online" | "in-person" | "hybrid">("online")
  const [isPublic, setIsPublic] = useState(true)
  const [requiresApproval, setRequiresApproval] = useState(false)
  
  // Ticket tiers
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { id: "1", name: "General Admission", price: 0, quantity: 100, description: "" }
  ])

  const addTicketTier = () => {
    setTicketTiers([
      ...ticketTiers,
      { 
        id: Math.random().toString(36).substr(2, 9), 
        name: "", 
        price: 0, 
        quantity: 50, 
        description: "" 
      }
    ])
  }

  const removeTicketTier = (id: string) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((t) => t.id !== id))
    }
  }

  const updateTicketTier = (id: string, field: keyof TicketTier, value: string | number) => {
    setTicketTiers(ticketTiers.map((t) => 
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  const handleCreate = async () => {
    setIsCreating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/admin/events")
  }

  const totalTickets = ticketTiers.reduce((sum, t) => sum + t.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
          <p className="text-muted-foreground">
            Set up a new event with ticketing
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Basic information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Tech Conference 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB (Recommended: 1920x1080)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["online", "in-person", "hybrid"] as const).map((type) => (
                    <label 
                      key={type}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        locationType === type ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        value={type}
                        checked={locationType === type}
                        onChange={() => setLocationType(type)}
                        className="sr-only"
                      />
                      {type === "online" && <Globe className="h-4 w-4" />}
                      {type === "in-person" && <MapPin className="h-4 w-4" />}
                      {type === "hybrid" && <Users className="h-4 w-4" />}
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {locationType !== "online" && (
                <div className="space-y-2">
                  <Label htmlFor="location">Venue Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Enter venue address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              {(locationType === "online" || locationType === "hybrid") && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    A KOVIN Meet room will be automatically created for this event.
                    The meeting link will be shared with attendees after registration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ticket Tiers</CardTitle>
                  <CardDescription>
                    Configure pricing and availability
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addTicketTier}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTiers.map((tier, index) => (
                <div key={tier.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Tier {index + 1}</Badge>
                    {ticketTiers.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeTicketTier(tier.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Tier Name *</Label>
                      <Input
                        placeholder="e.g., VIP, Early Bird"
                        value={tier.name}
                        onChange={(e) => updateTicketTier(tier.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={tier.price || ""}
                          onChange={(e) => updateTicketTier(tier.id, "price", parseFloat(e.target.value) || 0)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={tier.quantity}
                        onChange={(e) => updateTicketTier(tier.id, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="What is included with this ticket?"
                      value={tier.description}
                      onChange={(e) => updateTicketTier(tier.id, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Access & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Visibility</Label>
                <Select value={isPublic ? "public" : "private"} onValueChange={(v) => setIsPublic(v === "public")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isPublic 
                    ? "Anyone can discover and register for this event" 
                    : "Only people with the link can register"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval</Label>
                  <p className="text-xs text-muted-foreground">
                    Manually approve registrations
                  </p>
                </div>
                <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{date || "Not set"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span>{startTime && endTime ? `${startTime} - ${endTime}` : "Not set"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">{locationType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket Tiers</span>
                <span>{ticketTiers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Capacity</span>
                <span>{totalTickets} attendees</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Visibility</span>
                <Badge variant="outline">
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleCreate}
              disabled={!title || !date || !startTime || !endTime || isCreating}
            >
              {isCreating ? "Creating..." : "Create Event"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/events">Cancel</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
