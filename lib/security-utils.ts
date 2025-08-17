"use client";

import type { PersonnelData } from "./personnel-data";

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

  static escapeHtml(text: string): string {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!file || !file.name) {
      errors.push("فایل نامعتبر است")
      return { isValid: false, errors }
    }

    if (file.size > SECURITY_CONFIG.maxFileSize) {
      errors.push(`حجم فایل نباید بیشتر از ${SECURITY_CONFIG.maxFileSize / 1024 / 1024} مگابایت باشد`)
    }

    if (file.size < 10) {
      errors.push("فایل خالی یا خراب است")
    }

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    if (!SECURITY_CONFIG.allowedFileTypes.includes(fileExtension)) {
      errors.push(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${SECURITY_CONFIG.allowedFileTypes.join(", ")}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, number[]>()

    return {
      isAllowed: (identifier: string): boolean => {
        const now = Date.now()
        const userAttempts = attempts.get(identifier) || []
        const recentAttempts = userAttempts.filter((time) => now - time < windowMs)

        if (recentAttempts.length >= maxAttempts) {
          return false
        }

        recentAttempts.push(now)
        attempts.set(identifier, recentAttempts)

        return true
      },
    }
  }

  static validatePersonnelData(data: Partial<PersonnelData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data || typeof data !== "object") {
      errors.push("داده نامعتبر است")
      return { isValid: false, errors }
    }

    const requiredFields: (keyof PersonnelData)[] = [
      "personnelCode",
      "persianName",
      "englishName",
      "voipNumber",
      "project",
      "department",
      "position",
    ]

    for (const field of requiredFields) {
      if (!data[field] || typeof data[field as keyof typeof data] !== "string" || !(data[field as keyof typeof data] as string).trim()) {
        errors.push(`فیلد ${field} الزامی است`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static logSecurityEvent(event: string, details?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      event,
      details: details || {},
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    }

    console.log("[Security Event]", logEntry)
  }
}

export const fileUploadLimiter = SecurityUtils.createRateLimiter(
  SECURITY_CONFIG.maxUploadAttempts,
  60 * 1000, // 1 minute window
)
