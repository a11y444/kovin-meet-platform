"use client"

import { Mic, MicOff, Video, VideoOff, MoreVertical, X, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  isHost?: boolean
}

interface ParticipantsPanelProps {
  participants: Participant[]
  onClose: () => void
  onMuteParticipant?: (id: string) => void
  onRemoveParticipant?: (id: string) => void
  isHost: boolean
}

export function ParticipantsPanel({
  participants,
  onClose,
  onMuteParticipant,
  onRemoveParticipant,
  isHost,
}: ParticipantsPanelProps) {
  const hosts = participants.filter((p) => p.isHost)
  const others = participants.filter((p) => !p.isHost)

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">
          Participants ({participants.length})
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {hosts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Host
              </h4>
              <div className="space-y-1">
                {hosts.map((participant) => (
                  <ParticipantItem
                    key={participant.id}
                    participant={participant}
                    isHost={isHost}
                    onMute={onMuteParticipant}
                    onRemove={onRemoveParticipant}
                  />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Participants
              </h4>
              <div className="space-y-1">
                {others.map((participant) => (
                  <ParticipantItem
                    key={participant.id}
                    participant={participant}
                    isHost={isHost}
                    onMute={onMuteParticipant}
                    onRemove={onRemoveParticipant}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface ParticipantItemProps {
  participant: Participant
  isHost: boolean
  onMute?: (id: string) => void
  onRemove?: (id: string) => void
}

function ParticipantItem({ participant, isHost, onMute, onRemove }: ParticipantItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {participant.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {participant.name}
            {participant.isLocal && " (You)"}
          </span>
          {participant.isHost && (
            <Crown className="w-3 h-3 text-yellow-500" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {participant.isMuted ? (
          <MicOff className="w-4 h-4 text-destructive" />
        ) : (
          <Mic className="w-4 h-4 text-muted-foreground" />
        )}
        {participant.isVideoOff ? (
          <VideoOff className="w-4 h-4 text-destructive" />
        ) : (
          <Video className="w-4 h-4 text-muted-foreground" />
        )}

        {isHost && !participant.isLocal && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onMute?.(participant.id)}>
                {participant.isMuted ? "Request Unmute" : "Mute"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRemove?.(participant.id)}
                className="text-destructive"
              >
                Remove from meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
