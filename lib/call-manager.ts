export interface CallStrategy {
  name: string
  protocol: string
  priority: number
  isAvailable: () => boolean
  makeCall: (number: string, domain?: string) => Promise<boolean>
}

export class CallManager {
  private static instance: CallManager
  private strategies: CallStrategy[] = []
  private callHistory: Array<{ number: string; timestamp: Date; success: boolean; method: string }> = []

  static getInstance(): CallManager {
    if (!CallManager.instance) {
      CallManager.instance = new CallManager()
    }
    return CallManager.instance
  }

  constructor() {
    this.initializeStrategies()
  }

  private initializeStrategies(): void {
    this.strategies = [
      {
        name: "PortSIP UC",
        protocol: "portsip",
        priority: 1,
        isAvailable: () => this.isAppInstalled("portsip"),
        makeCall: async (number: string, domain = "yekta.sitakpbx") => {
          return this.attemptCall(`portsip:${number}@${domain}`)
        },
      },
      {
        name: "Zoiper",
        protocol: "zoiper",
        priority: 2,
        isAvailable: () => this.isAppInstalled("zoiper"),
        makeCall: async (number: string, domain = "yekta.sitakpbx") => {
          return this.attemptCall(`zoiper:${number}@${domain}`)
        },
      },
      {
        name: "SIP Protocol",
        protocol: "sip",
        priority: 3,
        isAvailable: () => true,
        makeCall: async (number: string, domain = "yekta.sitakpbx") => {
          return this.attemptCall(`sip:${number}@${domain}`)
        },
      },
      {
        name: "WebRTC",
        protocol: "webrtc",
        priority: 4,
        isAvailable: () => "webkitRTCPeerConnection" in window || "RTCPeerConnection" in window,
        makeCall: async (number: string, domain = "yekta.sitakpbx") => {
          return this.attemptCall(`webrtc:${number}@${domain}`)
        },
      },
      {
        name: "Tel Protocol",
        protocol: "tel",
        priority: 5,
        isAvailable: () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        makeCall: async (number: string) => {
          return this.attemptCall(`tel:${number}`)
        },
      },
    ]
  }

  private isAppInstalled(protocol: string): boolean {
    // Simple heuristic - in a real app, you might use more sophisticated detection
    const userAgent = navigator.userAgent.toLowerCase()
    return userAgent.includes(protocol) || localStorage.getItem(`${protocol}-available`) === "true"
  }

  private async attemptCall(uri: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Create invisible iframe to test protocol support
        const iframe = document.createElement("iframe")
        iframe.style.display = "none"
        iframe.src = uri
        document.body.appendChild(iframe)

        // Also try direct window.open
        const popup = window.open(uri, "_blank")

        setTimeout(() => {
          document.body.removeChild(iframe)

          if (popup && !popup.closed) {
            popup.close()
            resolve(true)
          } else {
            // Final fallback
            try {
              window.location.href = uri
              resolve(true)
            } catch {
              resolve(false)
            }
          }
        }, 1000)
      } catch (error) {
        console.error("Call attempt failed:", error)
        resolve(false)
      }
    })
  }

  async makeVipCall(
    number: string,
    domain = "yekta.sitakpbx",
  ): Promise<{
    attempts: Array<{ strategy: string; success: boolean }>
    overallSuccess: boolean
  }> {
    const availableStrategies = this.strategies.filter((s) => s.isAvailable()).sort((a, b) => a.priority - b.priority)

    const attempts: Array<{ strategy: string; success: boolean }> = []
    let overallSuccess = false

    for (const strategy of availableStrategies) {
      try {
        const success = await strategy.makeCall(number, domain)
        attempts.push({ strategy: strategy.name, success })

        if (success) {
          overallSuccess = true
          break // Stop on first success
        }
      } catch (error) {
        console.error(`Strategy ${strategy.name} failed:`, error)
        attempts.push({ strategy: strategy.name, success: false })
      }

      // Small delay between attempts
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Log call attempt
    this.callHistory.push({
      number,
      timestamp: new Date(),
      success: overallSuccess,
      method: attempts.find((a) => a.success)?.strategy || "none",
    })

    return { attempts, overallSuccess }
  }

  getCallHistory(): Array<{ number: string; timestamp: Date; success: boolean; method: string }> {
    return [...this.callHistory].reverse() // Most recent first
  }

  clearCallHistory(): void {
    this.callHistory = []
  }

  // Method to test and save app availability
  async testAppAvailability(protocol: string): Promise<boolean> {
    const available = await this.attemptCall(`${protocol}:test`)
    localStorage.setItem(`${protocol}-available`, available.toString())
    return available
  }
}
