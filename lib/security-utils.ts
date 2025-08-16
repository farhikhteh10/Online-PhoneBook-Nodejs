export interface SecurityConfig {
  maxFileSize: number
  allowedFileTypes: string[]
  maxUploadAttempts: number
  sessionTimeout: number
  passwordMinLength: number
}

export const SECURITY_CONFIG: SecurityConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [".csv", ".xlsx", ".xls"],
  maxUploadAttempts: 3,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  passwordMinLength: 8,
}

export class SecurityUtils {
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return ""

    return input
      .trim()
      .replace(/[<>"'&]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .replace(/data:/gi, "")
      .replace(/vbscript:/gi, "")
      .replace(/expression\(/gi, "")
      .replace(/url\(/gi, "")
      .substring(0, 500) // Limit input length
  }

  // XSS prevention
  static escapeHtml(text: string): string {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if file exists and is valid
    if (!file || !file.name) {
      errors.push("فایل نامعتبر است")
      return { isValid: false, errors }
    }

    // Check file size
    if (file.size > SECURITY_CONFIG.maxFileSize) {
      errors.push(`حجم فایل نباید بیشتر از ${SECURITY_CONFIG.maxFileSize / 1024 / 1024} مگابایت باشد`)
    }

    // Check minimum file size (prevent empty files)
    if (file.size < 10) {
      errors.push("فایل خالی یا خراب است")
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    if (!SECURITY_CONFIG.allowedFileTypes.includes(fileExtension)) {
      errors.push(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${SECURITY_CONFIG.allowedFileTypes.join(", ")}`)
    }

    if (/[<>:"|?*\\/]/.test(file.name)) {
      errors.push("نام فایل شامل کاراکترهای غیرمجاز است")
    }

    // Check for null bytes and control characters
    if (/[\x00-\x1f\x7f-\x9f]/.test(file.name)) {
      errors.push("نام فایل شامل کاراکترهای کنترلی غیرمجاز است")
    }

    // Check for executable file extensions
    const dangerousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".scr",
      ".pif",
      ".com",
      ".js",
      ".vbs",
      ".jar",
      ".app",
      ".deb",
      ".rpm",
    ]
    if (dangerousExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      errors.push("فایل‌های اجرایی مجاز نیستند")
    }

    const nameParts = file.name.toLowerCase().split(".")
    if (nameParts.length > 2) {
      for (let i = 1; i < nameParts.length - 1; i++) {
        if (dangerousExtensions.includes("." + nameParts[i])) {
          errors.push("فایل‌های با پسوند مضاعف مجاز نیستند")
          break
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Rate limiting
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, number[]>()

    return {
      isAllowed: (identifier: string): boolean => {
        const now = Date.now()
        const userAttempts = attempts.get(identifier) || []

        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter((time) => now - time < windowMs)

        if (recentAttempts.length >= maxAttempts) {
          return false
        }

        // Record this attempt
        recentAttempts.push(now)
        attempts.set(identifier, recentAttempts)

        return true
      },
      getRemainingAttempts: (identifier: string): number => {
        const now = Date.now()
        const userAttempts = attempts.get(identifier) || []
        const recentAttempts = userAttempts.filter((time) => now - time < windowMs)
        return Math.max(0, maxAttempts - recentAttempts.length)
      },
      reset: (identifier: string): void => {
        attempts.delete(identifier)
      },
    }
  }

  // Content Security Policy headers (for reference)
  static getCSPHeaders(): Record<string, string> {
    return {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    }
  }

  // Generate secure random password
  static generateSecurePassword(length = 12): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&"
    let password = ""

    // Ensure at least one character from each required category
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const symbols = "@$!%*?&"

    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }

  static validatePersonnelData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if data exists
    if (!data || typeof data !== "object") {
      errors.push("داده نامعتبر است")
      return { isValid: false, errors }
    }

    // Check for required fields
    const requiredFields = [
      "personnelCode",
      "persianName",
      "englishName",
      "voipNumber",
      "project",
      "department",
      "position",
    ]

    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== "string" || !data[field].trim()) {
        errors.push(`فیلد ${field} الزامی است`)
      }
    }

    if (data.personnelCode) {
      if (!/^\d+$/.test(data.personnelCode)) {
        errors.push("کد پرسنلی باید فقط شامل اعداد باشد")
      }
      if (data.personnelCode.length > 10) {
        errors.push("کد پرسنلی نباید بیشتر از 10 رقم باشد")
      }
    }

    if (data.voipNumber) {
      if (!/^\d+$/.test(data.voipNumber)) {
        errors.push("شماره ویپ باید فقط شامل اعداد باشد")
      }
      if (data.voipNumber.length > 8) {
        errors.push("شماره ویپ نباید بیشتر از 8 رقم باشد")
      }
    }

    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /eval\(/i,
      /document\./i,
      /alert\(/i,
      /confirm\(/i,
      /prompt\(/i,
      /window\./i,
      /location\./i,
      /cookie/i,
      /localStorage/i,
      /sessionStorage/i,
      /<object/i,
      /<embed/i,
      /vbscript:/i,
      /data:/i,
      /base64/i,
    ]

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        // Check length limits
        if (value.length > 200) {
          errors.push(`فیلد ${key} بیش از حد طولانی است`)
        }

        // Check for suspicious patterns
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            errors.push(`فیلد ${key} شامل محتوای مشکوک است`)
            break
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Log security events
  static logSecurityEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      event,
      details: details || {},
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    }

    console.log("[Security Event]", logEntry)

    // In a real application, you would send this to a logging service
    // Example: sendToLoggingService(logEntry)
  }
}

// File upload rate limiter
export const fileUploadLimiter = SecurityUtils.createRateLimiter(
  SECURITY_CONFIG.maxUploadAttempts,
  60 * 1000, // 1 minute window
)
