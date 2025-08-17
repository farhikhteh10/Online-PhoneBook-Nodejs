import { db } from './database';

export interface LoginAttempt {
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  loginAttempts: LoginAttempt[];
  lockedUntil?: number;
  sessionExpiry?: number;
  lastActivity?: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

export class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    isAuthenticated: false,
    loginAttempts: [],
  };
  private activityTimer?: NodeJS.Timeout;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>"'&]/g, "")
      .substring(0, 100);
  }

  private validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) return { isValid: false, message: "رمز عبور باید حداقل 8 کاراکتر باشد" };
    if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: "رمز عبور باید شامل حروف کوچک باشد" };
    if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: "رمز عبور باید شامل حروف بزرگ باشد" };
    if (!/(?=.*\d)/.test(password)) return { isValid: false, message: "رمز عبور باید شامل اعداد باشد" };
    if (!/(?=.*[@$!%*?&])/.test(password)) return { isValid: false, message: "رمز عبور باید شامل کاراکترهای خاص باشد" };
    return { isValid: true, message: "رمز عبور معتبر است" };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = "phonebook_salt_2024_" + Date.now().toString(36);
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    let hashBuffer = await crypto.subtle.digest("SHA-256", data);
    for (let i = 0; i < 1000; i++) {
        const roundData = encoder.encode(
            Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("") + salt
        );
        hashBuffer = await crypto.subtle.digest("SHA-256", roundData);
    }
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const user = await db.users.findByUsername('admin');
    // Simplified check for demo. A real app would hash the input password with a stored salt.
    return user?.passwordHash === hash && password === 'admin';
  }

  private startSessionTimer(): void {
    this.clearSessionTimer();
    this.authState.sessionExpiry = Date.now() + SESSION_TIMEOUT;
    this.authState.lastActivity = Date.now();
    this.activityTimer = setInterval(() => {
        if (this.isSessionExpired()) {
            this.logout();
        }
    }, ACTIVITY_CHECK_INTERVAL);
  }

  private clearSessionTimer(): void {
    if (this.activityTimer) {
        clearInterval(this.activityTimer);
        this.activityTimer = undefined;
    }
  }

  private logSecurityEvent(event: string, details?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    console.log(`[Security Event] ${event}`, { timestamp, details });
  }

  updateActivity(): void {
    if (this.authState.isAuthenticated) {
        this.authState.lastActivity = Date.now();
        this.authState.sessionExpiry = Date.now() + SESSION_TIMEOUT;
    }
  }

  isLocked(): boolean {
    return !!(this.authState.lockedUntil && Date.now() < this.authState.lockedUntil);
  }

  getRemainingLockTime(): number {
    return this.authState.lockedUntil ? Math.max(0, this.authState.lockedUntil - Date.now()) : 0;
  }

  getRecentAttempts(): number {
    const now = Date.now();
    return this.authState.loginAttempts.filter(attempt => now - attempt.timestamp < ATTEMPT_WINDOW).length;
  }

  async login(username: string, password: string, userAgent?: string): Promise<{ success: boolean; message: string }> {
    const sanitizedUsername = this.sanitizeInput(username);
    if (this.isLocked()) {
        const remainingTime = Math.ceil(this.getRemainingLockTime() / 60000);
        return { success: false, message: `حساب کاربری برای ${remainingTime} دقیقه قفل است.` };
    }

    const user = await db.users.findByUsername(sanitizedUsername);
    const passwordVerification = user ? await this.verifyPassword(password, user.passwordHash) : false;

    if (user && passwordVerification) {
        this.authState.isAuthenticated = true;
        this.authState.loginAttempts = [];
        this.startSessionTimer();
        return { success: true, message: "ورود موفقیت‌آمیز" };
    }

    this.authState.loginAttempts.push({ timestamp: Date.now(), userAgent });
    const recentAttempts = this.getRecentAttempts();
    if (recentAttempts >= MAX_ATTEMPTS) {
        this.authState.lockedUntil = Date.now() + LOCKOUT_DURATION;
        return { success: false, message: "تلاش‌های ناموفق زیاد است. حساب قفل شد." };
    }
    return { success: false, message: `نام کاربری یا رمز عبور اشتباه است.` };
  }

  logout(): void {
    this.authState.isAuthenticated = false;
    this.clearSessionTimer();
  }

  isAuthenticated(): boolean {
    return !this.isSessionExpired() && this.authState.isAuthenticated;
  }

  isSessionExpired(): boolean {
      return this.authState.sessionExpiry ? Date.now() > this.authState.sessionExpiry : false;
  }

  async changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
      const validation = this.validatePasswordStrength(newPassword);
      if (!validation.isValid) return { success: false, message: validation.message };
      const newPasswordHash = await this.hashPassword(newPassword);
      const success = await db.users.updatePassword('admin', newPasswordHash);
      return success ? { success: true, message: "رمز عبور با موفقیت تغییر کرد" } : { success: false, message: "خطا در تغییر رمز" };
  }

  getSecurityStatus() {
      return {
          isLocked: this.isLocked(),
          remainingLockTime: this.getRemainingLockTime(),
          recentAttempts: this.getRecentAttempts(),
          sessionTimeRemaining: this.authState.sessionExpiry ? Math.max(0, this.authState.sessionExpiry - Date.now()) : 0,
          isSessionActive: this.isAuthenticated(),
      };
  }
  
  clearLoginAttempts(): void {
      this.authState.loginAttempts = [];
      this.authState.lockedUntil = undefined;
  }
}
