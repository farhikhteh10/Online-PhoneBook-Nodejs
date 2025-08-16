export interface LoginAttempt {
  timestamp: number
  ip?: string
  userAgent?: string
}

export interface AuthState {
  isAuthenticated: boolean
  loginAttempts: LoginAttempt[]
  lockedUntil?: number
  sessionExpiry?: number
  lastActivity?: number
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000 // 5 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // 1 minute

export class AuthManager {
  private static instance: AuthManager
  private authState: AuthState = {
    isAuthenticated: false,
    loginAttempts: [],
  }
  private activityTimer?: NodeJS.Timeout

  private adminPasswordHash = "18c6f66eecaf3e0174aa33974bf5af9892b8adbaab6c12af1f834db3df9b1a3b" // Hash of "NewAdmin2024!" using SHA-256 with salt

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>"'&]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .replace(/data:/gi, "")
      .replace(/vbscript:/gi, "")
      .substring(0, 100) // Limit input length
  }

  private validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: "رمز عبور باید حداقل 8 کاراکتر باشد" }
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "رمز عبور باید شامل حروف کوچک باشد" }
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "رمز عبور باید شامل حروف بزرگ باشد" }
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "رمز عبور باید شامل اعداد باشد" }
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: "رمز عبور باید شامل کاراکترهای خاص باشد (@$!%*?&)" }
    }

    return { isValid: true, message: "رمز عبور معتبر است" }
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple but secure hashing using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(password + "phonebook_salt_2024") // Add salt

    if (typeof crypto !== "undefined" && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    } else {
      // Fallback for environments without crypto.subtle
      let hash = 0
      const str = password + "phonebook_salt_2024"
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16)
    }
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await this.hashPassword(password)
    return inputHash === hash
  }

  private startSessionTimer(): void {
    this.clearSessionTimer()
    this.authState.sessionExpiry = Date.now() + SESSION_TIMEOUT
    this.authState.lastActivity = Date.now()

    this.activityTimer = setInterval(() => {
      if (this.authState.sessionExpiry && Date.now() > this.authState.sessionExpiry) {
        this.logout()
        console.log("[Security] Session expired due to inactivity")
      }
    }, ACTIVITY_CHECK_INTERVAL)
  }

  private clearSessionTimer(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
      this.activityTimer = undefined
    }
  }

  private logSecurityEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString()
    console.log(`[Security] ${timestamp}: ${event}`, details || "")
  }

  updateActivity(): void {
    if (this.authState.isAuthenticated) {
      this.authState.lastActivity = Date.now()
      this.authState.sessionExpiry = Date.now() + SESSION_TIMEOUT
    }
  }

  getSessionTimeRemaining(): number {
    if (!this.authState.sessionExpiry) return 0
    return Math.max(0, this.authState.sessionExpiry - Date.now())
  }

  isSessionExpired(): boolean {
    return this.authState.sessionExpiry ? Date.now() > this.authState.sessionExpiry : false
  }

  isLocked(): boolean {
    if (this.authState.lockedUntil && Date.now() < this.authState.lockedUntil) {
      return true
    }
    return false
  }

  getRemainingLockTime(): number {
    if (this.authState.lockedUntil) {
      return Math.max(0, this.authState.lockedUntil - Date.now())
    }
    return 0
  }

  getRecentAttempts(): number {
    const now = Date.now()
    const recentAttempts = this.authState.loginAttempts.filter((attempt) => now - attempt.timestamp < ATTEMPT_WINDOW)
    return recentAttempts.length
  }

  async login(username: string, password: string, userAgent?: string): Promise<{ success: boolean; message: string }> {
    if (!username || !password) {
      this.logSecurityEvent("Empty credentials provided")
      return { success: false, message: "نام کاربری و رمز عبور الزامی است" }
    }

    if (username.length > 50 || password.length > 100) {
      this.logSecurityEvent("Suspicious input length detected", {
        usernameLength: username.length,
        passwordLength: password.length,
      })
      return { success: false, message: "ورودی نامعتبر" }
    }

    const sanitizedUsername = this.sanitizeInput(username)
    const sanitizedPassword = this.sanitizeInput(password)

    if (this.isLocked()) {
      const remainingTime = Math.ceil(this.getRemainingLockTime() / 1000 / 60)
      this.logSecurityEvent("Login attempt while locked", { username: sanitizedUsername })
      return {
        success: false,
        message: `حساب کاربری قفل شده است. ${remainingTime} دقیقه صبر کنید.`,
      }
    }

    const passwordVerification = await this.verifyPassword(sanitizedPassword, this.adminPasswordHash)

    if (sanitizedUsername === "Adminesh" && passwordVerification) {
      this.authState.isAuthenticated = true
      this.authState.loginAttempts = [] // Clear attempts on successful login
      this.startSessionTimer()
      this.logSecurityEvent("Successful login", { username: sanitizedUsername, userAgent })
      return { success: true, message: "ورود موفقیت‌آمیز" }
    }

    // Record failed attempt with enhanced details
    this.authState.loginAttempts.push({
      timestamp: Date.now(),
      userAgent: userAgent || "Unknown",
    })

    const recentAttempts = this.getRecentAttempts()
    this.logSecurityEvent("Failed login attempt", {
      username: sanitizedUsername,
      attempts: recentAttempts,
      userAgent,
    })

    if (recentAttempts >= MAX_ATTEMPTS) {
      this.authState.lockedUntil = Date.now() + LOCKOUT_DURATION
      this.logSecurityEvent("Account locked due to multiple failed attempts", { username: sanitizedUsername })
      return {
        success: false,
        message: `تعداد تلاش‌های ناموفق زیاد است. حساب برای 15 دقیقه قفل شد.`,
      }
    }

    return {
      success: false,
      message: `نام کاربری یا رمز عبور اشتباه است. (${recentAttempts}/${MAX_ATTEMPTS} تلاش)`,
    }
  }

  logout(): void {
    this.logSecurityEvent("User logout", { wasAuthenticated: this.authState.isAuthenticated })
    this.authState.isAuthenticated = false
    this.authState.sessionExpiry = undefined
    this.authState.lastActivity = undefined
    this.clearSessionTimer()
  }

  isAuthenticated(): boolean {
    if (this.isSessionExpired()) {
      this.logout()
      return false
    }
    return this.authState.isAuthenticated
  }

  async changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const validation = this.validatePasswordStrength(newPassword)
    if (!validation.isValid) {
      return { success: false, message: validation.message }
    }

    if (await this.verifyPassword(newPassword, this.adminPasswordHash)) {
      return { success: false, message: "رمز عبور جدید نمی‌تواند مشابه رمز عبور فعلی باشد" }
    }

    this.adminPasswordHash = await this.hashPassword(newPassword)
    this.logSecurityEvent("Password changed successfully")
    return { success: true, message: "رمز عبور با موفقیت تغییر کرد" }
  }

  // getCurrentPassword(): string {
  //   return this.adminPassword
  // }

  getSecurityStatus(): {
    isLocked: boolean
    remainingLockTime: number
    recentAttempts: number
    sessionTimeRemaining: number
    isSessionActive: boolean
  } {
    return {
      isLocked: this.isLocked(),
      remainingLockTime: this.getRemainingLockTime(),
      recentAttempts: this.getRecentAttempts(),
      sessionTimeRemaining: this.getSessionTimeRemaining(),
      isSessionActive: this.authState.isAuthenticated && !this.isSessionExpired(),
    }
  }

  clearLoginAttempts(): void {
    this.authState.loginAttempts = []
    this.authState.lockedUntil = undefined
    this.logSecurityEvent("Login attempts cleared manually")
  }

  getLoginHistory(): LoginAttempt[] {
    return [...this.authState.loginAttempts].sort((a, b) => b.timestamp - a.timestamp)
  }
}
