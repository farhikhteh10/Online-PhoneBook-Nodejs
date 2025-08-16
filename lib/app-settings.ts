export interface AppSettings {
  companyName: string
  appTitle: string
  logoUrl: string
  faviconUrl: string
  themeColor: string
  designerCredit: string
}

const DEFAULT_SETTINGS: AppSettings = {
  companyName: "فراپخت",
  appTitle: "دفترچه تلفن آنلاین پرسنل شرکت فراپخت",
  logoUrl: "/logo-farapokht.png",
  faviconUrl: "/favicon.ico",
  themeColor: "#f97316",
  designerCredit: "طراحی شده توسط هادی علایی",
}

class AppSettingsManager {
  private static instance: AppSettingsManager
  private settings: AppSettings

  private constructor() {
    this.settings = this.loadSettings()
  }

  static getInstance(): AppSettingsManager {
    if (!AppSettingsManager.instance) {
      AppSettingsManager.instance = new AppSettingsManager()
    }
    return AppSettingsManager.instance
  }

  private loadSettings(): AppSettings {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("app-settings")
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
        } catch (error) {
          console.error("Failed to parse stored settings:", error)
        }
      }
    }
    return { ...DEFAULT_SETTINGS }
  }

  private saveSettings(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("app-settings", JSON.stringify(this.settings))
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings }
  }

  updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    this.updatePageElements()
  }

  private updatePageElements(): void {
    if (typeof window !== "undefined") {
      // Update page title
      document.title = this.settings.appTitle

      // Update favicon
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = this.settings.faviconUrl
      }

      // Update theme color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
      if (themeColorMeta) {
        themeColorMeta.content = this.settings.themeColor
      }
    }
  }

  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS }
    this.saveSettings()
    this.updatePageElements()
  }
}

export { AppSettingsManager }
