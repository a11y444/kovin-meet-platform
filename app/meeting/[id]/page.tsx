"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Monitor, 
  MessageSquare, 
  Users,
  Settings,
  MoreVertical,
  Hand,
  Record,
  Grid3X3,
  Maximize,
  Copy,
  Share2,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// Mock participants
const mockParticipants = [
  { id: "1", name: "You", isLocal: true, isMuted: false, isVideoOff: false },
  { id: "2", name: "Jane Smith", isLocal: false, isMuted: true, isVideoOff: false },
  { id: "3", name: "Bob Wilson", isLocal: false, isMuted: false, isVideoOff: true },
  { id: "4", name: "Alice Brown", isLocal: false, isMuted: false, isVideoOff: false },
]

const mockMessages = [
  { id: "1", sender: "Jane Smith", message: "Hi everyone!", time: "10:02 AM" },
  { id: "2", sender: "Bob Wilson", message: "Ready to start?", time: "10:03 AM" },
  { id: "3", sender: "You", message: "Yes, let me share my screen", time: "10:04 AM" },
]

export default function MeetingRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid")
  const [chatMessage, setChatMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const [meetingTime, setMeetingTime] = useState(0)

  // Meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  const handleEndCall = () => {
    router.push("/admin")
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    setMessages([...messages, {
      id: String(messages.length + 1),
      sender: "You",
      message: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }])
    setChatMessage("")
  }

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/join/${id}`)
  }

  return (
    <div className="h-screen flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Video className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Team Standup</h1>
              <p className="text-xs text-sidebar-foreground/60">Meeting ID: {id}</p>
            </div>
          </div>
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm font-mono">{formatTime(meetingTime)}</div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={copyMeetingLink}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <Lock className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}>
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  {viewMode === "grid" ? "Speaker View" : "Grid View"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Maximize className="w-4 h-4 mr-2" />
                  Full Screen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4">
          <div className={cn(
            "h-full gap-2",
            viewMode === "grid" 
              ? "grid grid-cols-2 grid-rows-2" 
              : "flex flex-col"
          )}>
            {mockParticipants.map((participant, index) => (
              <div 
                key={participant.id}
                className={cn(
                  "relative rounded-xl overflow-hidden bg-sidebar-accent/50",
                  viewMode === "speaker" && index === 0 && "flex-1",
                  viewMode === "speaker" && index > 0 && "h-24 w-32"
                )}
              >
                {/* Video placeholder or avatar */}
                {participant.isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-sidebar-accent flex items-center justify-center">
                      <span className="text-2xl font-semibold">
                        {participant.name[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-sidebar-accent/80 to-sidebar/80 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                      <Video className="w-8 h-8 text-sidebar-foreground/50" />
                    </div>
                  </div>
                )}
                
                {/* Participant info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {participant.isMuted && (
                        <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                          <MicOff className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-white">
                        {participant.name} {participant.isLocal && "(You)"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Speaking indicator */}
                {!participant.isMuted && (
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar panels */}
        {viewMode === "speaker" && mockParticipants.length > 1 && (
          <div className="w-40 p-2 flex flex-col gap-2 overflow-y-auto scrollbar-thin">
            {mockParticipants.slice(1).map((participant) => (
              <div 
                key={participant.id}
                className="relative aspect-video rounded-lg overflow-hidden bg-sidebar-accent/50 shrink-0"
              >
                {participant.isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {participant.name[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-sidebar-accent/80 to-sidebar/80" />
                )}
                <div className="absolute bottom-1 left-1 text-xs text-white/80 truncate max-w-[calc(100%-8px)]">
                  {participant.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-2 px-4 h-20 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full",
              isMuted 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-400" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full",
              isVideoOff 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-400" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full",
              isScreenSharing 
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
          >
            <Monitor className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full",
              isHandRaised 
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-400" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => setIsHandRaised(!isHandRaised)}
          >
            <Hand className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full",
              isRecording 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-400" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => setIsRecording(!isRecording)}
          >
            <Record className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="w-px h-8 bg-sidebar-border mx-2" />
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full relative",
              showParticipants 
                ? "bg-sidebar-primary/20 text-sidebar-primary" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => {
              setShowParticipants(!showParticipants)
              setShowChat(false)
            }}
          >
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs flex items-center justify-center">
              {mockParticipants.length}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full",
              showChat 
                ? "bg-sidebar-primary/20 text-sidebar-primary" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => {
              setShowChat(!showChat)
              setShowParticipants(false)
            }}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="w-px h-8 bg-sidebar-border mx-2" />
        
        <Button
          variant="destructive"
          size="lg"
          className="w-12 h-12 rounded-full"
          onClick={handleEndCall}
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </Button>
      </div>

      {/* Chat Sheet */}
      <Sheet open={showChat} onOpenChange={setShowChat}>
        <SheetContent side="right" className="w-80 bg-sidebar border-sidebar-border">
          <SheetHeader>
            <SheetTitle className="text-sidebar-foreground">Chat</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-60px)] mt-4">
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "p-3 rounded-lg",
                  msg.sender === "You" 
                    ? "bg-sidebar-primary/20 ml-8" 
                    : "bg-sidebar-accent mr-8"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{msg.sender}</span>
                    <span className="text-xs text-sidebar-foreground/60">{msg.time}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-sidebar-border">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-sidebar-accent border-0 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Participants Sheet */}
      <Sheet open={showParticipants} onOpenChange={setShowParticipants}>
        <SheetContent side="right" className="w-80 bg-sidebar border-sidebar-border">
          <SheetHeader>
            <SheetTitle className="text-sidebar-foreground">
              Participants ({mockParticipants.length})
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {mockParticipants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium">{participant.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {participant.name} {participant.isLocal && "(You)"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60">
                      {participant.isLocal ? "Host" : "Participant"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {participant.isMuted && (
                    <MicOff className="w-4 h-4 text-red-400" />
                  )}
                  {participant.isVideoOff && (
                    <VideoOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
