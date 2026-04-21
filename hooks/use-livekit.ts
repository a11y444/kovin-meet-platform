"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Room,
  RoomEvent,
  Track,
  Participant,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
  DataPacket_Kind,
} from "livekit-client"

interface UseLiveKitOptions {
  url: string
  token: string
  roomName: string
  onConnected?: () => void
  onDisconnected?: () => void
  onParticipantJoined?: (participant: RemoteParticipant) => void
  onParticipantLeft?: (participant: RemoteParticipant) => void
  onError?: (error: Error) => void
}

interface ParticipantState {
  id: string
  name: string
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking: boolean
  isLocal: boolean
  isHost?: boolean
  videoTrack?: MediaStreamTrack | null
  audioTrack?: MediaStreamTrack | null
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  isLocal: boolean
}

export function useLiveKit(options: UseLiveKitOptions) {
  const { url, token, roomName, onConnected, onDisconnected, onParticipantJoined, onParticipantLeft, onError } = options
  
  const roomRef = useRef<Room | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const [participants, setParticipants] = useState<ParticipantState[]>([])
  const [localParticipant, setLocalParticipant] = useState<ParticipantState | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenShareTrack, setScreenShareTrack] = useState<MediaStreamTrack | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const getParticipantState = useCallback((participant: Participant, isLocal: boolean): ParticipantState => {
    const audioTrack = participant.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack
    const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track?.mediaStreamTrack
    
    return {
      id: participant.identity,
      name: participant.name || participant.identity,
      isMuted: !audioTrack || participant.getTrackPublication(Track.Source.Microphone)?.isMuted || false,
      isVideoOff: !videoTrack || participant.getTrackPublication(Track.Source.Camera)?.isMuted || false,
      isSpeaking: participant.isSpeaking,
      isLocal,
      videoTrack: videoTrack || null,
      audioTrack: audioTrack || null,
    }
  }, [])

  const updateParticipants = useCallback(() => {
    if (!roomRef.current) return

    const room = roomRef.current
    const allParticipants: ParticipantState[] = []

    // Add local participant
    if (room.localParticipant) {
      const localState = getParticipantState(room.localParticipant, true)
      setLocalParticipant(localState)
      allParticipants.push(localState)
    }

    // Add remote participants
    room.remoteParticipants.forEach((participant) => {
      allParticipants.push(getParticipantState(participant, false))
    })

    setParticipants(allParticipants)
  }, [getParticipantState])

  const connect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect()
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 },
      },
    })

    roomRef.current = room

    // Set up event listeners
    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      setConnectionState(state)
      if (state === ConnectionState.Connected) {
        onConnected?.()
      } else if (state === ConnectionState.Disconnected) {
        onDisconnected?.()
      }
    })

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      updateParticipants()
      onParticipantJoined?.(participant)
    })

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      updateParticipants()
      onParticipantLeft?.(participant)
    })

    room.on(RoomEvent.TrackSubscribed, () => updateParticipants())
    room.on(RoomEvent.TrackUnsubscribed, () => updateParticipants())
    room.on(RoomEvent.TrackMuted, () => updateParticipants())
    room.on(RoomEvent.TrackUnmuted, () => updateParticipants())
    room.on(RoomEvent.ActiveSpeakersChanged, () => updateParticipants())
    room.on(RoomEvent.LocalTrackPublished, () => updateParticipants())
    room.on(RoomEvent.LocalTrackUnpublished, () => updateParticipants())

    room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const decoder = new TextDecoder()
        const data = JSON.parse(decoder.decode(payload))
        if (data.type === "chat") {
          setChatMessages((prev) => [
            ...prev,
            {
              id: data.id,
              senderId: participant?.identity || "unknown",
              senderName: participant?.name || "Unknown",
              message: data.message,
              timestamp: new Date(data.timestamp),
              isLocal: false,
            },
          ])
        }
      } catch (e) {
        console.error("Failed to parse data message:", e)
      }
    })

    room.on(RoomEvent.RecordingStatusChanged, (recording) => {
      setIsRecording(recording)
    })

    try {
      await room.connect(url, token)
      await room.localParticipant.enableCameraAndMicrophone()
      updateParticipants()
    } catch (error) {
      onError?.(error as Error)
    }
  }, [url, token, onConnected, onDisconnected, onParticipantJoined, onParticipantLeft, onError, updateParticipants])

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect()
      roomRef.current = null
    }
  }, [])

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return
    
    const newMuted = !isMuted
    await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted)
    setIsMuted(newMuted)
    updateParticipants()
  }, [isMuted, updateParticipants])

  const toggleVideo = useCallback(async () => {
    if (!roomRef.current) return
    
    const newVideoOff = !isVideoOff
    await roomRef.current.localParticipant.setCameraEnabled(!newVideoOff)
    setIsVideoOff(newVideoOff)
    updateParticipants()
  }, [isVideoOff, updateParticipants])

  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current) return

    if (isScreenSharing) {
      await roomRef.current.localParticipant.setScreenShareEnabled(false)
      setIsScreenSharing(false)
      setScreenShareTrack(null)
    } else {
      try {
        await roomRef.current.localParticipant.setScreenShareEnabled(true)
        const screenTrack = roomRef.current.localParticipant.getTrackPublication(Track.Source.ScreenShare)?.track?.mediaStreamTrack
        setIsScreenSharing(true)
        setScreenShareTrack(screenTrack || null)
      } catch (error) {
        console.error("Failed to start screen share:", error)
      }
    }
  }, [isScreenSharing])

  const sendChatMessage = useCallback(async (message: string) => {
    if (!roomRef.current) return

    const msgData = {
      type: "chat",
      id: crypto.randomUUID(),
      message,
      timestamp: new Date().toISOString(),
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(msgData))

    await roomRef.current.localParticipant.publishData(data, { reliable: true })

    setChatMessages((prev) => [
      ...prev,
      {
        id: msgData.id,
        senderId: roomRef.current?.localParticipant.identity || "",
        senderName: roomRef.current?.localParticipant.name || "You",
        message,
        timestamp: new Date(),
        isLocal: true,
      },
    ])
  }, [])

  const muteParticipant = useCallback(async (participantId: string) => {
    // This would typically be done through the LiveKit server API
    // For now, we'll send a data message requesting the participant to mute
    if (!roomRef.current) return

    const msgData = {
      type: "mute_request",
      targetId: participantId,
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(msgData))
    await roomRef.current.localParticipant.publishData(data, { reliable: true })
  }, [])

  const removeParticipant = useCallback(async (participantId: string) => {
    // This would be done through the LiveKit server API
    console.log("Remove participant:", participantId)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    room: roomRef.current,
    connectionState,
    participants,
    localParticipant,
    isMuted,
    isVideoOff,
    isScreenSharing,
    screenShareTrack,
    chatMessages,
    isRecording,
    connect,
    disconnect,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage,
    muteParticipant,
    removeParticipant,
  }
}
