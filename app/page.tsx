"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button-fallback"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { personnelData, addPersonnel, updatePersonnel, deletePersonnel, type PersonnelData } from "@/lib/personnel-data"
import { LoginForm } from "@/components/login-form"
import { AdminPanel } from "@/components/admin-panel"
import { AuthManager } from "@/lib/auth"
import { toPersianNumbers } from "@/lib/utils"
import { AppSettingsManager } from "@/lib/app-settings"
import { EnhancedVipCalling } from "@/components/enhanced-vip-calling"

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
)

const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    checkInstallation()

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!isInstalled) {
        setShowInstallPrompt(true)
      }
    }

    const appInstalledHandler = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", appInstalledHandler)

    const autoPromptTimer = setTimeout(() => {
      if (deferredPrompt && !isInstalled && !localStorage.getItem("pwa-install-dismissed")) {
        setShowInstallPrompt(true)
      }
    }, 30000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", appInstalledHandler)
      clearTimeout(autoPromptTimer)
    }
  }, [deferredPrompt, isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
        setIsInstalled(true)
        localStorage.setItem("pwa-installed", "true")
      }
    } catch (error) {
      console.error("PWA installation failed:", error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showInstallPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <Card className="glass border-border/50 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-xl flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1 text-right">نصب اپلیکیشن</h4>
              <p className="text-xs text-muted-foreground mb-3 text-right">
                دفترچه تلفن را روی گوشی خود نصب کنید تا دسترسی سریع‌تری داشته باشید
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1 text-xs bg-primary hover:bg-primary/90 rounded-xl"
                >
                  نصب
                </Button>
                <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-xs rounded-xl">
                  بعداً
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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

const VipNumberPopup = ({
  voipNumber,
  onClose,
  position,
}: { voipNumber: string; onClose: () => void; position: { x: number; y: number } }) => {
  return <EnhancedVipCalling voipNumber={voipNumber} onClose={onClose} position={position} />
}

export default function PhoneDirectory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [showLogin, setShowLogin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentData, setCurrentData] = useState(personnelData)
  const [vipPopup, setVipPopup] = useState<{ voipNumber: string; position: { x: number; y: number } } | null>(null)

  const [appSettings, setAppSettings] = useState(AppSettingsManager.getInstance().getSettings())

  useEffect(() => {
    const settingsManager = AppSettingsManager.getInstance()
    const updateSettings = () => {
      setAppSettings(settingsManager.getSettings())
    }

    // Update settings when component mounts
    updateSettings()

    // Listen for storage changes (when settings are updated in admin panel)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app-settings") {
        updateSettings()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    if (urlParams.get("search") === "true") {
      // Focus search input when opened via search shortcut
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="جستجو"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }, 100)
    }

    if (urlParams.get("admin") === "true") {
      // Show login when opened via admin shortcut
      setShowLogin(true)
    }
  }, [])

  // Get unique values for filters
  const uniqueProjects = useMemo(() => {
    const projects = [...new Set(currentData.map((person) => person.project))]
    return projects.sort()
  }, [currentData])

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(currentData.map((person) => person.department))]
    return departments.sort()
  }, [currentData])

  const uniquePositions = useMemo(() => {
    const positions = [...new Set(currentData.map((person) => person.position))]
    return positions.sort()
  }, [currentData])

  // Filter and search logic
  const filteredData = useMemo(() => {
    return currentData.filter((person) => {
      const matchesSearch =
        searchTerm === "" ||
        person.persianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.personnelCode.includes(searchTerm) ||
        person.voipNumber.includes(searchTerm) ||
        person.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.position.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProject = projectFilter === "all" || person.project === projectFilter
      const matchesDepartment = departmentFilter === "all" || person.department === departmentFilter
      const matchesPosition = positionFilter === "all" || person.position === positionFilter

      return matchesSearch && matchesProject && matchesDepartment && matchesPosition
    })
  }, [currentData, searchTerm, projectFilter, departmentFilter, positionFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setProjectFilter("all")
    setDepartmentFilter("all")
    setPositionFilter("all")
  }

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true)
      setShowLogin(false)
      AuthManager.getInstance().updateActivity()
    }
  }

  const handleLogout = () => {
    AuthManager.getInstance().logout()
    setIsAuthenticated(false)
  }

  const handleAddPersonnel = (person: PersonnelData) => {
    const result = addPersonnel(person)
    setCurrentData([...personnelData])
    return result
  }

  const handleUpdatePersonnel = (personnelCode: string, updatedData: Partial<PersonnelData>) => {
    const result = updatePersonnel(personnelCode, updatedData)
    setCurrentData([...personnelData])
    return result
  }

  const handleDeletePersonnel = (personnelCode: string) => {
    const result = deletePersonnel(personnelCode)
    setCurrentData([...personnelData])
    return result
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (isAuthenticated) {
      AuthManager.getInstance().updateActivity()
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case "project":
        setProjectFilter(value)
        break
      case "department":
        setDepartmentFilter(value)
        break
      case "position":
        setPositionFilter(value)
        break
    }
    if (isAuthenticated) {
      AuthManager.getInstance().updateActivity()
    }
  }

  const handleVipClick = (voipNumber: string, event: React.MouseEvent) => {
    event.preventDefault()
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setVipPopup({
      voipNumber,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    })
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setVipPopup(null)
    }

    if (vipPopup) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [vipPopup])

  if (isAuthenticated) {
    return (
      <AdminPanel
        personnelData={currentData}
        onAddPersonnel={handleAddPersonnel}
        onUpdatePersonnel={handleUpdatePersonnel}
        onDeletePersonnel={handleDeletePersonnel}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 relative">
      {showLogin && <LoginForm onLogin={handleLogin} />}

      <PWAInstallPrompt />

      {vipPopup && (
        <VipNumberPopup
          voipNumber={vipPopup.voipNumber}
          onClose={() => setVipPopup(null)}
          position={vipPopup.position}
        />
      )}

      <div className="max-w-7xl mx-auto shadow-sm">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 animate-float">
            <img
              src={appSettings.logoUrl || "/placeholder.svg"}
              alt={`لوگو شرکت ${appSettings.companyName}`}
              className="h-12 sm:h-16 md:h-20 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl animate-glow">
              <UsersIcon />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 text-center leading-[5rem]">
              {appSettings.appTitle}
            </h1>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-3xl mx-auto px-2 sm:px-0">
            <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <SearchIcon />
            </div>
            <Input
              placeholder="جستجو در نام، کد پرسنلی، شماره ویپ، پروژه، بخش یا سمت..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-12 sm:pr-16 pl-4 sm:pl-6 py-4 sm:py-6 text-base sm:text-lg glass border-2 border-gray-300 md:border-border/50 rounded-2xl sm:rounded-3xl focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md text-black placeholder:text-gray-500"
              dir="rtl"
              maxLength={100}
            />
          </div>

          <div className="max-w-3xl mx-auto mt-4 sm:mt-6 px-2 sm:px-0">
            <div className="grid grid-cols-3 gap-2 md:hidden">
              <div>
                <Select value={projectFilter} onValueChange={(value) => handleFilterChange("project", value)}>
                  <SelectTrigger className="text-center border-border/50 rounded-xl h-10 glass">
                    <div className="flex items-center justify-center gap-1">
                      <FilterIcon />
                      <span className="text-xs">پروژه</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50 rounded-xl">
                    <SelectItem value="all">همه پروژه‌ها</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={departmentFilter} onValueChange={(value) => handleFilterChange("department", value)}>
                  <SelectTrigger className="text-center border-border/50 rounded-xl h-10 glass">
                    <div className="flex items-center justify-center gap-1">
                      <FilterIcon />
                      <span className="text-xs">بخش</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50 rounded-xl">
                    <SelectItem value="all">همه بخش‌ها</SelectItem>
                    {uniqueDepartments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={positionFilter} onValueChange={(value) => handleFilterChange("position", value)}>
                  <SelectTrigger className="text-center border-border/50 rounded-xl h-10 glass">
                    <div className="flex items-center justify-center gap-1">
                      <FilterIcon />
                      <span className="text-xs">سمت</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50 rounded-xl">
                    <SelectItem value="all">همه سمت‌ها</SelectItem>
                    {uniquePositions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3 mt-2">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full h-10 border-border/50 rounded-xl glass hover:bg-secondary/10 hover:border-secondary/50 flex items-center justify-center gap-2 transition-all duration-300 bg-transparent text-sm"
                >
                  <ClearIcon />
                  پاک کردن
                </Button>
              </div>
            </div>

            {/* Desktop filters */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="text-sm font-semibold mb-2 sm:mb-3 block text-center text-foreground">پروژه</label>
                <Select value={projectFilter} onValueChange={(value) => handleFilterChange("project", value)}>
                  <SelectTrigger className="text-center border-border/50 rounded-xl sm:rounded-2xl h-10 sm:h-12 glass">
                    <SelectValue placeholder="انتخاب پروژه" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50 rounded-xl sm:rounded-2xl">
                    <SelectItem value="all">همه پروژه‌ها</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 sm:mb-3 block text-center text-foreground">بخش</label>
                <Select value={departmentFilter} onValueChange={(value) => handleFilterChange("department", value)}>
                  <SelectTrigger className="text-center border-border/50 rounded-xl sm:rounded-2xl h-10 sm:h-12 glass">
                    <SelectValue placeholder="انتخاب بخش" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50 rounded-xl sm:rounded-2xl">
                    <SelectItem value="all">همه بخش‌ها</SelectItem>
                    {uniqueDepartments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 sm:mb-3 block text-center text-foreground">سمت</label>
                <Select value={positionFilter} onValueChange={(value) => handleFilterChange("position", value)}>
                  <SelectTrigger className="text-center border-border/50 rounded-xl sm:rounded-2xl h-10 sm:h-12 glass">
                    <SelectValue placeholder="انتخاب سمت" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50 rounded-xl sm:rounded-2xl">
                    <SelectItem value="all">همه سمت‌ها</SelectItem>
                    {uniquePositions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full h-10 sm:h-12 border-border/50 rounded-xl sm:rounded-2xl glass hover:bg-secondary/10 hover:border-secondary/50 flex items-center gap-2 transition-all duration-300 bg-transparent text-sm sm:text-base"
                >
                  <ClearIcon />
                  پاک کردن فیلترها
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card className="glass border-border/50 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden mx-2 sm:mx-0">
          <CardContent className="p-0">
            {/* Mobile card layout */}
            <div className="block md:hidden">
              {filteredData.map((person, index) => (
                <div
                  key={person.personnelCode}
                  className={`p-4 border-b border-border/30 hover:bg-primary/5 transition-all duration-300 ${
                    index % 2 === 0 ? "bg-card/50" : "bg-background/50"
                  } ${index === filteredData.length - 1 ? "border-b-0 rounded-b-2xl" : ""} ${index === 0 ? "rounded-t-2xl" : ""}`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-base mb-1">{person.persianName}</h3>
                        <p className="text-sm text-muted-foreground">{person.englishName}</p>
                      </div>
                      <button
                        onClick={(e) => handleVipClick(person.voipNumber, e)}
                        className="bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer flex items-center gap-2"
                      >
                        <CallIcon />
                        <span className="font-mono text-primary font-bold text-sm">
                          {toPersianNumbers(person.voipNumber)}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">پروژه:</span>
                        <span className="text-foreground bg-muted/50 px-2 py-1 rounded text-xs">{person.project}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">بخش:</span>
                        <span className="text-foreground">{person.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">سمت:</span>
                        <span className="text-foreground">{person.position}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px] rounded-2xl overflow-hidden">
                <thead className="bg-gray-100 border-b border-border/50">
                  <tr>
                    <th className="text-center p-3 sm:p-6 font-bold text-slate-800 text-sm sm:text-base first:rounded-tl-2xl">
                      نام فارسی
                    </th>
                    <th className="text-center p-3 sm:p-6 font-bold text-slate-800 text-sm sm:text-base">
                      نام انگلیسی
                    </th>
                    <th className="text-center p-3 sm:p-6 font-bold text-slate-800 text-sm sm:text-base">پروژه</th>
                    <th className="text-center p-3 sm:p-6 font-bold text-slate-800 text-sm sm:text-base">بخش</th>
                    <th className="text-center p-3 sm:p-6 font-bold text-slate-800 text-sm sm:text-base">سمت</th>
                    <th className="text-center p-3 sm:p-6 font-bold text-slate-800 text-sm sm:text-base last:rounded-tr-2xl">
                      شماره ویپ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((person, index) => (
                    <tr
                      key={person.personnelCode}
                      className={`border-b border-border/30 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg ${
                        index % 2 === 0 ? "bg-card/50" : "bg-background/50"
                      } ${index === filteredData.length - 1 ? "border-b-0" : ""}`}
                    >
                      <td
                        className={`p-3 sm:p-6 font-bold text-foreground text-sm sm:text-base text-center ${index === filteredData.length - 1 ? "rounded-bl-2xl" : ""}`}
                      >
                        {person.persianName}
                      </td>
                      <td className="p-3 sm:p-6 text-muted-foreground text-sm sm:text-base text-center">
                        {person.englishName}
                      </td>
                      <td className="p-3 sm:p-6 text-center">
                        <span className="text-xs sm:text-sm text-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                          {person.project}
                        </span>
                      </td>
                      <td className="p-3 sm:p-6 text-center">{person.department}</td>
                      <td className="p-3 sm:p-6 text-center">{person.position}</td>
                      <td
                        className={`p-3 sm:p-6 font-mono text-primary font-bold text-sm sm:text-base text-center ${index === filteredData.length - 1 ? "rounded-br-2xl" : ""}`}
                      >
                        <button
                          onClick={(e) => handleVipClick(person.voipNumber, e)}
                          className="hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
                        >
                          {toPersianNumbers(person.voipNumber)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12 sm:py-20 px-4 sm:px-6">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center animate-float">
                  <UsersIcon />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground">نتیجه‌ای یافت نشد</h3>
                <p className="text-muted-foreground text-base sm:text-lg">لطفاً عبارت جستجو یا فیلترها را تغییر دهید</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 sm:mt-12 flex justify-between items-center px-4 sm:px-6 py-4">
          <Button
            onClick={() => setShowLogin(true)}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent flex items-center gap-1 opacity-50 hover:opacity-100 transition-all duration-300"
          >
            <AdminIcon />
            ورود
          </Button>

          <p className="text-xs text-muted-foreground/60">{appSettings.designerCredit}</p>
        </div>
      </div>
    </div>
  )
}
