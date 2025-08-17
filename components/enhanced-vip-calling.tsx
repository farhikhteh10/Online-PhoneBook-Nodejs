"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const CallIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
)

const LoadingIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface CallAttempt {
  name: string
  status: "pending" | "attempting" | "success" | "failed"
  uri: string
  delay: number
}

interface EnhancedVipCallingProps {
  voipNumber: string
  onClose: () => void
  position: { x: number; y: number }
}

export const EnhancedVipCalling = ({ voipNumber, onClose, position }: EnhancedVipCallingProps) => {
  const [callAttempts, setCallAttempts] = useState<CallAttempt[]>([])
  const [isAttempting, setIsAttempting] = useState(false)
  const [showAttempts, setShowAttempts] = useState(false)

  const callStrategies: CallAttempt[] = [
    {
      name: "PortSIP UC",
      uri: `portsip:${voipNumber}@yekta.sitakpbx`,
      delay: 0,
      status: "pending",
    },
    {
      name: "SIP Protocol",
      uri: `sip:${voipNumber}@yekta.sitakpbx`,
      delay: 800,
      status: "pending",
    },
    {
      name: "WebRTC Call",
      uri: `webrtc:${voipNumber}@yekta.sitakpbx`,
      delay: 1600,
      status: "pending",
    },
    {
      name: "Zoiper App",
      uri: `zoiper:${voipNumber}@yekta.sitakpbx`,
      delay: 2400,
      status: "pending",
    },
    {
      name: "Tel Protocol",
      uri: `tel:${voipNumber}`,
      delay: 3200,
      status: "pending",
    },
  ]

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(voipNumber)
      alert("شماره کپی شد")
      onClose()
    } catch (err) {
      console.error("Failed to copy:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = voipNumber
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        alert("شماره کپی شد")
      } catch {
        alert("خطا در کپی کردن شماره")
      }
      document.body.removeChild(textArea)
      onClose()
    }
  }

  const makeVipCall = async () => {
    setIsAttempting(true)
    setShowAttempts(true)
    setCallAttempts([...callStrategies])

    for (let i = 0; i < callStrategies.length; i++) {
      const strategy = callStrategies[i]

      setTimeout(async () => {
        setCallAttempts((prev) =>
          prev.map((attempt, index) => (index === i ? { ...attempt, status: "attempting" } : attempt)),
        )

        try {
          const success = await attemptCall(strategy.uri)
          setCallAttempts((prev) =>
            prev.map((attempt, index) =>
              index === i ? { ...attempt, status: success ? "success" : "failed" } : attempt,
            ),
          )
          if (success && i < callStrategies.length - 1) {
            setCallAttempts((prev) =>
              prev.map((attempt, index) => (index > i ? { ...attempt, status: "pending" } : attempt)),
            )
          }
        } catch (error) {
          console.error(`Failed ${strategy.name}:`, error)
          setCallAttempts((prev) =>
            prev.map((attempt, index) => (index === i ? { ...attempt, status: "failed" } : attempt)),
          )
        }

        if (i === callStrategies.length - 1) {
          setTimeout(() => {
            setIsAttempting(false)
          }, 1000)
        }
      }, strategy.delay)
    }
  }

  const attemptCall = async (uri: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const link = document.createElement("a")
        link.href = uri
        link.target = "_blank"
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        const popup = window.open(uri, "_blank")

        setTimeout(() => {
          if (popup && !popup.closed) {
            resolve(true)
          } else {
            try {
              window.location.href = uri
              resolve(true)
            } catch {
              resolve(false)
            }
          }
        }, 100)
      } catch {
        resolve(false)
      }
    })
  }

  const makeRegularCall = () => {
    const telUri = `tel:${voipNumber}`
    try {
      window.open(telUri, "_blank")
    } catch {
      if (navigator.userAgent.includes("Mobile")) {
        window.location.href = telUri
      } else {
        alert(`شماره تماس: ${voipNumber}`)
      }
    }
    onClose()
  }

  const getStatusIcon = (status: CallAttempt["status"]) => {
    switch (status) {
      case "attempting":
        return <LoadingIcon />
      case "success":
        return <CheckIcon />
      case "failed":
        return <XIcon />
      default:
        return null
    }
  }

  const getStatusColor = (status: CallAttempt["status"]) => {
    switch (status) {
      case "attempting":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const adjustedPosition = {
    x: Math.min(Math.max(position.x, 150), window.innerWidth - 150),
    y: Math.max(position.y - 10, 10),
  }

  return (
    <div
      className="fixed z-50 max-w-sm"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Card className="glass border-border/50 shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">شماره: {voipNumber}</p>
              <p className="text-xs text-muted-foreground">yekta.sitakpbx</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={makeVipCall}
                variant="default"
                size="sm"
                className="justify-center gap-2 h-10 bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={isAttempting}
              >
                {isAttempting ? <LoadingIcon /> : <CallIcon />}
                {isAttempting ? "در حال تماس VoIP..." : "تماس VoIP (چندگانه)"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={makeRegularCall}
                  variant="outline"
                  size="sm"
                  className="justify-center gap-2 h-9 text-xs bg-transparent"
                >
                  <PhoneIcon />
                  تماس معمولی
                </Button>

                <Button
                  onClick={copyNumber}
                  variant="outline"
                  size="sm"
                  className="justify-center gap-2 h-9 text-xs bg-transparent"
                >
                  <CopyIcon />
                  کپی شماره
                </Button>
              </div>
            </div>

            {showAttempts && callAttempts.length > 0 && (
              <div className="border-t pt-3 mt-1">
                <p className="text-xs font-semibold mb-2 text-center">وضعیت تماس‌ها:</p>
                <div className="space-y-1">
                  {callAttempts.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="flex-1">{attempt.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-0.5 flex items-center gap-1 ${getStatusColor(attempt.status)}`}
                      >
                        {getStatusIcon(attempt.status)}
                        {attempt.status === "pending" && "در انتظار"}
                        {attempt.status === "attempting" && "تلاش"}
                        {attempt.status === "success" && "موفق"}
                        {attempt.status === "failed" && "ناموفق"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-2 border-t">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                بستن
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
