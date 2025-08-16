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
      .replace(/expression\(/gi, "")
      .replace(/url\(/gi, "")
      .replace(/import\s/gi, "")
      .replace(/eval\(/gi, "")
      .replace(/document\./gi, "")
      .replace(/window\./gi, "")
      .replace(/location\./gi, "")
      .replace(/cookie/gi, "")
      .replace(/localStorage/gi, "")
      .replace(/sessionStorage/gi, "")
      .substring(0, 100) // Limit input length
  }

  private validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: "رمز عبور باید حداقل 8 کاراکتر باشد" }
    }

    if (password.length > 128) {
      return { isValid: false, message: "رمز عبور نباید بیشتر از 128 کاراکتر باشد" }
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

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456/, // Sequential numbers
      /abcdef/, // Sequential letters
      /qwerty/i, // Common keyboard patterns
      /password/i, // Common words
      /admin/i, // Common admin terms
    ]

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        return { isValid: false, message: "رمز عبور شامل الگوهای ضعیف است" }
      }
    }

    return { isValid: true, message: "رمز عبور معتبر است" }
  }

  private async hashPassword(password: string): Promise<string> {
    // Enhanced salt with timestamp and random component
    const salt = "phonebook_salt_2024_" + Date.now().toString(36)
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)

    if (typeof crypto !== "undefined" && crypto.subtle) {
      // Use multiple rounds of hashing for better security
      let hashBuffer = await crypto.subtle.digest("SHA-256", data)

      // Additional rounds of hashing
      for (let i = 0; i < 1000; i++) {
        const roundData = encoder.encode(
          Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("") + salt,
        )
        hashBuffer = await crypto.subtle.digest("SHA-256", roundData)
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    } else {
      // Enhanced fallback for environments without crypto.subtle
      let hash = 0
      const str = password + salt
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32-bit integer
      }

      // Additional processing for better security
      for (let i = 0; i < 1000; i++) {
        hash = (hash * 31 + i) & 0x7fffffff
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
        this.logSecurityEvent("Session expired due to inactivity", {
          sessionDuration: SESSION_TIMEOUT,
          lastActivity: this.authState.lastActivity,
        })
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
    const logEntry = {
      timestamp,
      event,
      details: details || {},
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      sessionId: this.generateSessionId(),
      ip: this.getClientIP(),
    }

    console.log(`[Security] ${timestamp}: ${event}`, logEntry)

    // Store security events in localStorage for admin review
    try {
      const existingLogs = JSON.parse(localStorage.getItem("security-logs") || "[]")
      existingLogs.push(logEntry)

      // Keep only last 100 events
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }

      localStorage.setItem("security-logs", JSON.stringify(existingLogs))
    } catch (error) {
      console.error("Failed to store security log:", error)
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private getClientIP(): string {
    // In a real application, this would be handled server-side
    return "client-side-unknown"
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
    // Enhanced input validation
    if (!username || !password) {
      this.logSecurityEvent("Empty credentials provided", { username: username || "[empty]" })
      return { success: false, message: "نام کاربری و رمز عبور الزامی است" }
    }

    if (username.length > 50 || password.length > 128) {
      this.logSecurityEvent("Suspicious input length detected", {
        usernameLength: username.length,
        passwordLength: password.length,
      })
      return { success: false, message: "ورودی نامعتبر" }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /location\./i,
      /cookie/i,
      /localStorage/i,
      /sessionStorage/i,
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(username) || pattern.test(password)) {
        this.logSecurityEvent("Suspicious input pattern detected", {
          username: username.substring(0, 20) + "...",
          pattern: pattern.toString(),
        })
        return { success: false, message: "ورودی شامل محتوای مشکوک است" }
      }
    }

    const sanitizedUsername = this.sanitizeInput(username)
    const sanitizedPassword = this.sanitizeInput(password)

    if (this.isLocked()) {
      const remainingTime = Math.ceil(this.getRemainingLockTime() / 1000 / 60)
      this.logSecurityEvent("Login attempt while locked", {
        username: sanitizedUsername,
        remainingLockTime: remainingTime,
      })
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
      this.logSecurityEvent("Successful login", {
        username: sanitizedUsername,
        userAgent,
        sessionTimeout: SESSION_TIMEOUT,
      })
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
      maxAttempts: MAX_ATTEMPTS,
    })

    if (recentAttempts >= MAX_ATTEMPTS) {
      this.authState.lockedUntil = Date.now() + LOCKOUT_DURATION
      this.logSecurityEvent("Account locked due to multiple failed attempts", {
        username: sanitizedUsername,
        lockDuration: LOCKOUT_DURATION,
        totalAttempts: recentAttempts,
      })
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
    this.logSecurityEvent("User logout", {
      wasAuthenticated: this.authState.isAuthenticated,
      sessionDuration: this.authState.lastActivity ? Date.now() - this.authState.lastActivity : 0,
    })
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
      this.logSecurityEvent("Password change failed - weak password", { reason: validation.message })
      return { success: false, message: validation.message }
    }

    if (await this.verifyPassword(newPassword, this.adminPasswordHash)) {
      this.logSecurityEvent("Password change failed - same as current")
      return { success: false, message: "رمز عبور جدید نمی‌تواند مشابه رمز عبور فعلی باشد" }
    }

    const oldHash = this.adminPasswordHash
    this.adminPasswordHash = await this.hashPassword(newPassword)

    this.logSecurityEvent("Password changed successfully", {
      oldHashPrefix: oldHash.substring(0, 8),
      newHashPrefix: this.adminPasswordHash.substring(0, 8),
    })

    return { success: true, message: "رمز عبور با موفقیت تغییر کرد" }
  }

  getSecurityStatus(): {
    isLocked: boolean
    remainingLockTime: number
    recentAttempts: number
    sessionTimeRemaining: number
    isSessionActive: boolean
    lastActivity?: number
    securityLevel: "low" | "medium" | "high" | "critical"
  } {
    const recentAttempts = this.getRecentAttempts()
    let securityLevel: "low" | "medium" | "high" | "critical" = "low"

    if (this.isLocked()) {
      securityLevel = "critical"
    } else if (recentAttempts >= 3) {
      securityLevel = "high"
    } else if (recentAttempts > 0) {
      securityLevel = "medium"
    }

    return {
      isLocked: this.isLocked(),
      remainingLockTime: this.getRemainingLockTime(),
      recentAttempts,
      sessionTimeRemaining: this.getSessionTimeRemaining(),
      isSessionActive: this.authState.isAuthenticated && !this.isSessionExpired(),
      lastActivity: this.authState.lastActivity,
      securityLevel,
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

  getSecurityLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem("security-logs") || "[]")
    } catch (error) {
      console.error("Failed to retrieve security logs:", error)
      return []
    }
  }

  clearSecurityLogs(): void {
    try {
      localStorage.removeItem("security-logs")
      this.logSecurityEvent("Security logs cleared by admin")
    } catch (error) {
      console.error("Failed to clear security logs:", error)
    }
  }
}
