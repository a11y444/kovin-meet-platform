"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Globe, 
  Lock,
  Shield,
  Settings,
  Copy,
  Check
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewMeetingPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [meetingType, setMeetingType] = useState<"instant" | "scheduled">("scheduled")
  const [copied, setCopied] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [maxParticipants, setMaxParticipants] = useState("100")
  const [isPublic, setIsPublic] = useState(false)
  const [waitingRoom, setWaitingRoom] = useState(true)
  const [recordingEnabled, setRecordingEnabled] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [screenShareEnabled, setScreenShareEnabled] = useState(true)

  const generateMeetingLink = () => {
    const id = Math.random().toString(36).substring(2, 10)
    return `https://meet.kovin.io/m/${id}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateMeetingLink())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreate = async () => {
    setIsCreating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/admin/meetings")
  }

  const handleInstantMeeting = async () => {
    setIsCreating(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const meetingId = Math.random().toString(36).substring(2, 10)
    router.push(`/meeting/${meetingId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/meetings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Meeting</h1>
          <p className="text-muted-foreground">
            Create an instant meeting or schedule one for later
          </p>
        </div>
      </div>

      <Tabs value={meetingType} onValueChange={(v) => setMeetingType(v as "instant" | "scheduled")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="instant">
            <Video className="mr-2 h-4 w-4" />
            Instant Meeting
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Meeting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instant" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Instant Meeting</CardTitle>
              <CardDescription>
                Start a meeting immediately and invite participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Ready to start?</h3>
                    <p className="text-sm text-muted-foreground">
                      Click below to start your meeting instantly
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meeting Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generateMeetingLink()}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with participants to join
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Waiting Room</Label>
                    <p className="text-sm text-muted-foreground">
                      Approve participants before they join
                    </p>
                  </div>
                  <Switch checked={waitingRoom} onCheckedChange={setWaitingRoom} />
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleInstantMeeting} disabled={isCreating}>
                <Video className="mr-2 h-5 w-5" />
                {isCreating ? "Starting..." : "Start Meeting Now"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                  <CardDescription>
                    Basic information about your meeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Weekly Team Standup"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Add a description for participants..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
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
                      <Label htmlFor="time">Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Meeting Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <Label>Waiting Room</Label>
                        <p className="text-sm text-muted-foreground">
                          Approve participants before they can join
                        </p>
                      </div>
                    </div>
                    <Switch checked={waitingRoom} onCheckedChange={setWaitingRoom} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="space-y-0.5">
                        <Label>Enable Recording</Label>
                        <p className="text-sm text-muted-foreground">
                          Record the meeting to MinIO storage
                        </p>
                      </div>
                    </div>
                    <Switch checked={recordingEnabled} onCheckedChange={setRecordingEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="space-y-0.5">
                        <Label>Chat</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow participants to send messages
                        </p>
                      </div>
                    </div>
                    <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="space-y-0.5">
                        <Label>Screen Sharing</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow participants to share their screen
                        </p>
                      </div>
                    </div>
                    <Switch checked={screenShareEnabled} onCheckedChange={setScreenShareEnabled} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Access & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meeting Type</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!isPublic}
                          onChange={() => setIsPublic(false)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span className="font-medium">Private</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Only invited users can join
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="visibility"
                          checked={isPublic}
                          onChange={() => setIsPublic(true)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="font-medium">Public</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Anyone with the link can join
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-participants">Max Participants</Label>
                    <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 participants</SelectItem>
                        <SelectItem value="25">25 participants</SelectItem>
                        <SelectItem value="50">50 participants</SelectItem>
                        <SelectItem value="100">100 participants</SelectItem>
                        <SelectItem value="250">250 participants</SelectItem>
                        <SelectItem value="500">500 participants</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <span>{time || "Not set"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Visibility</span>
                    <Badge variant="outline">
                      {isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recording</span>
                    <Badge variant={recordingEnabled ? "default" : "secondary"}>
                      {recordingEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleCreate}
                  disabled={!title || !date || !time || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Meeting"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/meetings">Cancel</Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
