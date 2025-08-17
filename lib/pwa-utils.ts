// phone-js/lib/pwa-utils.ts
export class PWAManager {
  private static instance: PWAManager
  private updateAvailable = false
  private registration: ServiceWorkerRegistration | null = null

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  async registerServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register("/sw.js")

        this.registration.addEventListener("updatefound", () => {
          const newWorker = this.registration?.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                this.updateAvailable = true
                this.notifyUpdateAvailable()
              }
            })
          }
        })

        console.log("Service Worker registered successfully")
      } catch (error) {
        console.error("Service Worker registration failed:", error)
      }
    }
  }

  private notifyUpdateAvailable(): void {
    // Show update notification
    if (confirm("نسخه جدید اپلیکیشن در دسترس است. آیا می‌خواهید به‌روزرسانی کنید؟")) {
      this.updateApp()
    }
  }

  async updateApp(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" })
      window.location.reload()
    }
  }

  isInstalled(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  async shareContent(data: { title: string; text: string; url?: string }): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch (error) {
        console.error("Sharing failed:", error)
        // Fallback to clipboard
        this.copyToClipboard(data.text + (data.url ? ` ${data.url}` : ""))
      }
    } else {
      this.copyToClipboard(data.text + (data.url ? ` ${data.url}` : ""))
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      alert("متن کپی شد")
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  requestPersistentStorage(): void {
    if ("storage" in navigator && "persist" in navigator.storage) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log("Persistent storage granted")
        }
      })
    }
  }
}

// Initialize PWA manager
if (typeof window !== "undefined") {
  const pwaManager = PWAManager.getInstance()
  pwaManager.registerServiceWorker()
  pwaManager.requestPersistentStorage()
}
