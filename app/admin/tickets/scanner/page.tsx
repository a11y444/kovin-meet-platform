"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode, CheckCircle2, XCircle, Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TicketValidation {
  valid: boolean
  ticket?: {
    id: string
    ticketCode: string
    eventTitle: string
    ticketType: string
    holderName: string
    holderEmail: string
    isCheckedIn: boolean
    checkedInAt?: string
  }
  message: string
}

export default function TicketScannerPage() {
  const [ticketCode, setTicketCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [validation, setValidation] = useState<TicketValidation | null>(null)

  const validateTicket = async (code: string) => {
    if (!code.trim()) return

    setIsValidating(true)
    setValidation(null)

    try {
      const res = await fetch(`/api/tickets/validate?code=${encodeURIComponent(code)}`)
      const data = await res.json()

      if (res.ok) {
        setValidation({
          valid: true,
          ticket: data.ticket,
          message: data.ticket.isCheckedIn 
            ? `Already checked in at ${new Date(data.ticket.checkedInAt).toLocaleString()}`
            : "Valid ticket - ready for check-in",
        })
      } else {
        setValidation({
          valid: false,
          message: data.error || "Invalid ticket",
        })
      }
    } catch (error) {
      setValidation({
        valid: false,
        message: "Failed to validate ticket",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const checkInTicket = async () => {
    if (!validation?.ticket?.id) return

    setIsCheckingIn(true)

    try {
      const res = await fetch(`/api/tickets/${validation.ticket.id}/validate`, {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        setValidation({
          valid: true,
          ticket: { ...validation.ticket, isCheckedIn: true, checkedInAt: new Date().toISOString() },
          message: "Successfully checked in!",
        })
      } else {
        setValidation({
          ...validation,
          message: data.error || "Failed to check in",
        })
      }
    } catch (error) {
      setValidation({
        ...validation,
        message: "Failed to check in ticket",
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  const resetScanner = () => {
    setTicketCode("")
    setValidation(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ticket Scanner</h1>
          <p className="text-muted-foreground">Scan QR codes or enter ticket codes manually</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Manual Entry
            </CardTitle>
            <CardDescription>Enter the ticket code manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="XXXX-XXXX-XXXX"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    validateTicket(ticketCode)
                  }
                }}
                className="font-mono text-lg tracking-wider"
              />
              <Button 
                onClick={() => validateTicket(ticketCode)}
                disabled={isValidating || !ticketCode.trim()}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Validate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Camera Scanner Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Scanner
            </CardTitle>
            <CardDescription>Scan ticket QR code with camera</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Camera scanner available on mobile devices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Result */}
      {validation && (
        <Card className={validation.valid ? "border-green-500" : "border-red-500"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {validation.valid ? (
                <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold ${validation.valid ? "text-green-600" : "text-red-600"}`}>
                    {validation.valid ? "Valid Ticket" : "Invalid Ticket"}
                  </h3>
                  <p className="text-muted-foreground">{validation.message}</p>
                </div>

                {validation.ticket && (
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Event</span>
                      <span className="font-medium">{validation.ticket.eventTitle}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Ticket Type</span>
                      <span className="font-medium">{validation.ticket.ticketType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Holder</span>
                      <span className="font-medium">{validation.ticket.holderName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{validation.ticket.holderEmail}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Code</span>
                      <span className="font-mono">{validation.ticket.ticketCode}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {validation.valid && validation.ticket && !validation.ticket.isCheckedIn && (
                    <Button onClick={checkInTicket} disabled={isCheckingIn} className="bg-green-600 hover:bg-green-700">
                      {isCheckingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking in...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Check In
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" onClick={resetScanner}>
                    Scan Another
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
