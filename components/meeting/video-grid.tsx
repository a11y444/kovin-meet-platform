"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Video, VideoOff, Pin, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Participant {
  id: string
  name: string
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking: boolean
  isLocal: boolean
  isPinned?: boolean
  videoTrack?: MediaStreamTrack | null
  audioTrack?: MediaStreamTrack | null
}

interface VideoGridProps {
  participants: Participant[]
  pinnedParticipantId: string | null
  onPinParticipant: (id: string | null) => void
  screenShareTrack?: MediaStreamTrack | null
  isScreenSharing?: boolean
}

export function VideoGrid({
  participants,
  pinnedParticipantId,
  onPinParticipant,
  screenShareTrack,
  isScreenSharing,
}: VideoGridProps) {
  const [gridLayout, setGridLayout] = useState<"grid" | "spotlight">("grid")

  useEffect(() => {
    if (pinnedParticipantId || isScreenSharing) {
      setGridLayout("spotlight")
    } else {
      setGridLayout("grid")
    }
  }, [pinnedParticipantId, isScreenSharing])

  const pinnedParticipant = participants.find((p) => p.id === pinnedParticipantId)
  const otherParticipants = participants.filter((p) => p.id !== pinnedParticipantId)

  const getGridCols = (count: number) => {
    if (count <= 1) return "grid-cols-1"
    if (count <= 2) return "grid-cols-2"
    if (count <= 4) return "grid-cols-2"
    if (count <= 6) return "grid-cols-3"
    if (count <= 9) return "grid-cols-3"
    return "grid-cols-4"
  }

  if (gridLayout === "spotlight" && (pinnedParticipant || isScreenSharing)) {
    return (
      <div className="flex h-full gap-4">
        <div className="flex-1 flex items-center justify-center">
          {isScreenSharing && screenShareTrack ? (
            <ScreenShareView track={screenShareTrack} />
          ) : pinnedParticipant ? (
            <ParticipantTile
              participant={pinnedParticipant}
              isPinned
              onPin={() => onPinParticipant(null)}
              size="large"
            />
          ) : null}
        </div>
        {otherParticipants.length > 0 && (
          <div className="w-64 flex flex-col gap-2 overflow-y-auto">
            {otherParticipants.map((participant) => (
              <ParticipantTile
                key={participant.id}
                participant={participant}
                onPin={() => onPinParticipant(participant.id)}
                size="small"
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-4 h-full w-full p-4",
        getGridCols(participants.length)
      )}
    >
      {participants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          onPin={() => onPinParticipant(participant.id)}
          size="medium"
        />
      ))}
    </div>
  )
}

interface ParticipantTileProps {
  participant: Participant
  isPinned?: boolean
  onPin: () => void
  size: "small" | "medium" | "large"
}

function ParticipantTile({ participant, isPinned, onPin, size }: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && participant.videoTrack) {
      const stream = new MediaStream([participant.videoTrack])
      videoRef.current.srcObject = stream
    }
  }, [participant.videoTrack])

  const sizeClasses = {
    small: "h-36",
    medium: "h-full min-h-48",
    large: "h-full",
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-muted",
        sizeClasses[size],
        participant.isSpeaking && "ring-2 ring-primary"
      )}
    >
      {participant.isVideoOff ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {participant.isMuted ? (
              <MicOff className="w-4 h-4 text-destructive" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
            <span className="text-sm text-white font-medium truncate">
              {participant.name} {participant.isLocal && "(You)"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPin}>
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isPinned && (
        <div className="absolute top-3 left-3">
          <Pin className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}

function ScreenShareView({ track }: { track: MediaStreamTrack }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && track) {
      const stream = new MediaStream([track])
      videoRef.current.srcObject = stream
    }
  }, [track])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 rounded-full">
        <span className="text-sm text-white">Screen Share</span>
      </div>
    </div>
  )
}
