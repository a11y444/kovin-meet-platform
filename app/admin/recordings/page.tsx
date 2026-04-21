"use client"

import { useState } from "react"
import { 
  Video, 
  Download, 
  Trash2, 
  Play,
  Calendar,
  Clock,
  User,
  HardDrive,
  Search,
  Filter,
  MoreHorizontal,
  Eye
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

// Mock recordings data
const mockRecordings = [
  {
    id: "rec_1",
    meetingTitle: "Q4 Planning Session",
    hostName: "John Smith",
    recordedAt: "2024-01-15T14:30:00Z",
    duration: 3720,
    fileSize: 256000000,
    status: "ready",
    thumbnailUrl: null,
  },
  {
    id: "rec_2",
    meetingTitle: "Product Demo - Client XYZ",
    hostName: "Sarah Johnson",
    recordedAt: "2024-01-14T10:00:00Z",
    duration: 1800,
    fileSize: 128000000,
    status: "processing",
    thumbnailUrl: null,
  },
  {
    id: "rec_3",
    meetingTitle: "Weekly Team Standup",
    hostName: "Mike Wilson",
    recordedAt: "2024-01-12T09:00:00Z",
    duration: 900,
    fileSize: 64000000,
    status: "ready",
    thumbnailUrl: null,
  },
  {
    id: "rec_4",
    meetingTitle: "Training: New Features",
    hostName: "Emily Brown",
    recordedAt: "2024-01-10T15:00:00Z",
    duration: 5400,
    fileSize: 384000000,
    status: "ready",
    thumbnailUrl: null,
  },
]

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1000000000) {
    return `${(bytes / 1000000000).toFixed(1)} GB`
  }
  return `${(bytes / 1000000).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRecording, setSelectedRecording] = useState<typeof mockRecordings[0] | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  const filteredRecordings = mockRecordings.filter((recording) => {
    const matchesSearch = recording.meetingTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || recording.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalStorage = mockRecordings.reduce((sum, r) => sum + r.fileSize, 0)
  const readyCount = mockRecordings.filter((r) => r.status === "ready").length
  const processingCount = mockRecordings.filter((r) => r.status === "processing").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recordings</h1>
        <p className="text-muted-foreground">
          Manage meeting recordings and playback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRecordings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalStorage)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
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
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recordings Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meeting</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecordings.map((recording) => (
              <TableRow key={recording.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-16 items-center justify-center rounded bg-muted">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {recording.meetingTitle}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {recording.hostName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(recording.recordedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDuration(recording.duration)}
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(recording.fileSize)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      recording.status === "ready" ? "default" : "secondary"
                    }
                  >
                    {recording.status}
                  </Badge>
                </TableCell>
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
                          setSelectedRecording(recording)
                          setIsPlayerOpen(true)
                        }}
                        disabled={recording.status !== "ready"}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Watch
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={recording.status !== "ready"}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedRecording?.meetingTitle}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-75">Video player placeholder</p>
              <p className="text-xs opacity-50 mt-2">
                Connect to MinIO storage to enable playback
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Host: {selectedRecording?.hostName}</span>
            <span>Duration: {selectedRecording && formatDuration(selectedRecording.duration)}</span>
            <span>Size: {selectedRecording && formatFileSize(selectedRecording.fileSize)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
