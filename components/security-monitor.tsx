"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthManager } from "@/lib/auth"

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

interface SecurityMonitorProps {
  onClearAttempts?: () => void
}

export function SecurityMonitor({ onClearAttempts }: SecurityMonitorProps) {
  const [securityStatus, setSecurityStatus] = useState({
    isLocked: false,
    remainingLockTime: 0,
    recentAttempts: 0,
    sessionTimeRemaining: 0,
    isSessionActive: false,
  })

  useEffect(() => {
    const updateStatus = () => {
      const authManager = AuthManager.getInstance()
      const status = authManager.getSecurityStatus()
      setSecurityStatus(status)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleClearAttempts = () => {
    const authManager = AuthManager.getInstance()
    authManager.clearLoginAttempts()
    if (onClearAttempts) {
      onClearAttempts()
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right text-gray-800">
          <ShieldIcon />
          وضعیت امنیتی سیستم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Status */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <ClockIcon className="text-blue-600" />
            <span className="text-blue-800 font-medium">وضعیت جلسه</span>
          </div>
          <div className="text-left">
            {securityStatus.isSessionActive ? (
              <div>
                <Badge className="bg-green-100 text-green-800 border-green-200">فعال</Badge>
                <p className="text-sm text-blue-700 mt-1">
                  زمان باقی‌مانده: {formatTime(securityStatus.sessionTimeRemaining)}
                </p>
              </div>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">غیرفعال</Badge>
            )}
          </div>
        </div>

        {/* Lock Status */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertIcon className="text-yellow-600" />
            <span className="text-yellow-800 font-medium">وضعیت قفل</span>
          </div>
          <div className="text-left">
            {securityStatus.isLocked ? (
              <div>
                <Badge className="bg-red-100 text-red-800 border-red-200">قفل شده</Badge>
                <p className="text-sm text-yellow-700 mt-1">
                  زمان باقی‌مانده: {formatTime(securityStatus.remainingLockTime)}
                </p>
              </div>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-green-200">آزاد</Badge>
            )}
          </div>
        </div>

        {/* Login Attempts */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span className="text-gray-800 font-medium">تلاش‌های ورود اخیر</span>
            <p className="text-sm text-gray-600">در 5 دقیقه گذشته</p>
          </div>
          <div className="text-left">
            <Badge
              className={`${
                securityStatus.recentAttempts > 3
                  ? "bg-red-100 text-red-800 border-red-200"
                  : securityStatus.recentAttempts > 0
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-green-100 text-green-800 border-green-200"
              }`}
            >
              {securityStatus.recentAttempts} / 5
            </Badge>
          </div>
        </div>

        {/* Clear Attempts Button */}
        {securityStatus.recentAttempts > 0 && (
          <div className="pt-2">
            <Button
              onClick={handleClearAttempts}
              variant="outline"
              size="sm"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              پاک کردن تلاش‌های ناموفق
            </Button>
          </div>
        )}

        {/* Security Tips */}
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-medium text-emerald-800 mb-2">نکات امنیتی</h4>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>• رمز عبور قوی انتخاب کنید</li>
            <li>• پس از استفاده از سیستم خارج شوید</li>
            <li>• فایل‌های مشکوک بارگذاری نکنید</li>
            <li>• اطلاعات ورود را با دیگران به اشتراک نگذارید</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
