"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button-fallback"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge-fallback"
import { type PersonnelData, getUniqueProjects, getUniqueDepartments, getUniquePositions } from "@/lib/personnel-data"
import { AuthManager } from "@/lib/auth"
import { validatePersonnelData } from "@/lib/validation"
import { FileUpload } from "@/components/file-upload"
import type { FileUploadResult } from "@/lib/file-utils"
import { SecurityMonitor } from "@/components/security-monitor"
import { SecurityUtils } from "@/lib/security-utils"
import { AppSettingsManager, type AppSettings } from "@/lib/app-settings"
import { uploadFile, validateImageFile } from "@/lib/file-upload-utils"

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

interface AdminPanelProps {
  personnelData: PersonnelData[]
  onAddPersonnel: (person: PersonnelData) => { success: boolean; message: string }
  onUpdatePersonnel: (
    personnelCode: string,
    updatedData: Partial<PersonnelData>,
  ) => { success: boolean; message: string }
  onDeletePersonnel: (personnelCode: string) => { success: boolean; message: string }
  onLogout: () => void
}

export function AdminPanel({
  personnelData,
  onAddPersonnel,
  onUpdatePersonnel,
  onDeletePersonnel,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"add" | "edit" | "upload" | "settings">("add")
  const [editingPerson, setEditingPerson] = useState<PersonnelData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")

  const [appSettings, setAppSettings] = useState<AppSettings>(AppSettingsManager.getInstance().getSettings())
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<PersonnelData>({
    personnelCode: "",
    persianName: "",
    englishName: "",
    voipNumber: "",
    project: "",
    department: "",
    position: "",
  })

  const resetForm = () => {
    setFormData({
      personnelCode: "",
      persianName: "",
      englishName: "",
      voipNumber: "",
      project: "",
      department: "",
      position: "",
    })
    setEditingPerson(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const securityValidation = SecurityUtils.validatePersonnelData(formData)
    if (!securityValidation.isValid) {
      setMessage(securityValidation.errors.join(", "))
      SecurityUtils.logSecurityEvent("Invalid personnel data submission", { errors: securityValidation.errors })
      return
    }

    const validation = validatePersonnelData(formData)
    if (!validation.isValid) {
      setMessage(validation.errors.join(", "))
      return
    }

    if (editingPerson) {
      const result = onUpdatePersonnel(editingPerson.personnelCode, formData)
      setMessage(result.message)
      if (result.success) {
        SecurityUtils.logSecurityEvent("Personnel data updated", { personnelCode: editingPerson.personnelCode })
      }
    } else {
      const result = onAddPersonnel(formData)
      setMessage(result.message)
      if (result.success) {
        resetForm()
        SecurityUtils.logSecurityEvent("New personnel added", { personnelCode: formData.personnelCode })
      }
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const handleEdit = (person: PersonnelData) => {
    setFormData(person)
    setEditingPerson(person)
    setActiveTab("edit")
  }

  const handleDelete = (personnelCode: string) => {
    if (confirm("آیا از حذف این پرسنل اطمینان دارید؟")) {
      const result = onDeletePersonnel(personnelCode)
      setMessage(result.message)
      if (result.success) {
        SecurityUtils.logSecurityEvent("Personnel deleted", { personnelCode })
      }
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("رمز عبور و تکرار آن یکسان نیستند")
      return
    }

    const authManager = AuthManager.getInstance()
    const result = await authManager.changePassword(newPassword)
    setMessage(result.message)

    if (result.success) {
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordChange(false)
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const filteredPersonnel = personnelData.filter(
    (person) =>
      person.persianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.personnelCode.includes(searchTerm),
  )

  const uniqueProjects = getUniqueProjects()
  const uniqueDepartments = getUniqueDepartments()
  const uniquePositions = getUniquePositions()

  const handleFileUpload = (result: FileUploadResult) => {
    setMessage(result.message)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleLogoUpload = async (file: File, type: "logo" | "favicon") => {
    setIsUploading(true)
    try {
      const validation = await validateImageFile(file)
      if (!validation.valid) {
        setMessage(validation.error || "فایل نامعتبر است")
        return
      }

      const uploadedUrl = await uploadFile(file, type)
      const settingsManager = AppSettingsManager.getInstance()

      if (type === "logo") {
        settingsManager.updateSettings({ logoUrl: uploadedUrl })
        setMessage("لوگو با موفقیت آپلود شد")
      } else {
        settingsManager.updateSettings({ faviconUrl: uploadedUrl })
        setMessage("فاویکون با موفقیت آپلود شد")
      }

      setAppSettings(settingsManager.getSettings())
    } catch (error) {
      setMessage("خطا در آپلود فایل")
    } finally {
      setIsUploading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleSettingsUpdate = (field: keyof AppSettings, value: string) => {
    const settingsManager = AppSettingsManager.getInstance()
    settingsManager.updateSettings({ [field]: value })
    setAppSettings(settingsManager.getSettings())
    setMessage("تنظیمات با موفقیت به‌روزرسانی شد")
    setTimeout(() => setMessage(""), 3000)
  }

  const resetSettings = () => {
    if (confirm("آیا از بازگردانی تنظیمات به حالت پیش‌فرض اطمینان دارید؟")) {
      const settingsManager = AppSettingsManager.getInstance()
      settingsManager.resetToDefaults()
      setAppSettings(settingsManager.getSettings())
      setMessage("تنظیمات به حالت پیش‌فرض بازگردانده شد")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-center">پنل مدیریت</h1>
            <p className="text-gray-600 text-center">مدیریت اطلاعات پرسنل شرکت فراپخت</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <LogoutIcon />
            خروج
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.includes("موفقیت")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm">
          <Button
            onClick={() => setActiveTab("add")}
            variant={activeTab === "add" ? "default" : "ghost"}
            className={`flex-1 rounded-xl ${activeTab === "add" ? "bg-emerald-600 text-white" : "text-gray-600"}`}
          >
            <PlusIcon />
            افزودن پرسنل
          </Button>
          <Button
            onClick={() => setActiveTab("edit")}
            variant={activeTab === "edit" ? "default" : "ghost"}
            className={`flex-1 rounded-xl ${activeTab === "edit" ? "bg-emerald-600 text-white" : "text-gray-600"}`}
          >
            <EditIcon />
            ویرایش پرسنل
          </Button>
          <Button
            onClick={() => setActiveTab("upload")}
            variant={activeTab === "upload" ? "default" : "ghost"}
            className={`flex-1 rounded-xl ${activeTab === "upload" ? "bg-emerald-600 text-white" : "text-gray-600"}`}
          >
            <UploadIcon />
            بارگذاری فایل
          </Button>
          <Button
            onClick={() => setActiveTab("settings")}
            variant={activeTab === "settings" ? "default" : "ghost"}
            className={`flex-1 rounded-xl ${activeTab === "settings" ? "bg-emerald-600 text-white" : "text-gray-600"}`}
          >
            <SettingsIcon />
            تنظیمات
          </Button>
        </div>

        {/* Add Personnel Tab */}
        {activeTab === "add" && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">افزودن پرسنل جدید</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">کد پرسنلی *</label>
                    <Input
                      required
                      value={formData.personnelCode}
                      onChange={(e) => setFormData({ ...formData, personnelCode: e.target.value })}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">نام فارسی *</label>
                    <Input
                      required
                      value={formData.persianName}
                      onChange={(e) => setFormData({ ...formData, persianName: e.target.value })}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">نام انگلیسی *</label>
                    <Input
                      required
                      value={formData.englishName}
                      onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                      className="text-center border-gray-200 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">شماره ویپ *</label>
                    <Input
                      required
                      value={formData.voipNumber}
                      onChange={(e) => setFormData({ ...formData, voipNumber: e.target.value })}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">پروژه *</label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => setFormData({ ...formData, project: value })}
                    >
                      <SelectTrigger className="text-center border-gray-200 rounded-xl">
                        <SelectValue placeholder="انتخاب پروژه" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueProjects.map((project) => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">بخش *</label>
                    <Input
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">سمت *</label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger className="text-center border-gray-200 rounded-xl">
                        <SelectValue placeholder="انتخاب سمت" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniquePositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-200 rounded-xl bg-transparent"
                  >
                    پاک کردن
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                    افزودن پرسنل
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Personnel Tab */}
        {activeTab === "edit" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-center text-gray-800">جستجو و ویرایش پرسنل</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="جستجو بر اساس نام یا کد پرسنلی..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-center border-gray-200 rounded-xl mb-4"
                  dir="rtl"
                />

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-center p-3 font-semibold text-gray-700">کد پرسنلی</th>
                        <th className="text-center p-3 font-semibold text-gray-700">نام فارسی</th>
                        <th className="text-center p-3 font-semibold text-gray-700">شماره ویپ</th>
                        <th className="text-center p-3 font-semibold text-gray-700">پروژه</th>
                        <th className="text-center p-3 font-semibold text-gray-700">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonnel.slice(0, 10).map((person) => (
                        <tr key={person.personnelCode} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{person.personnelCode}</td>
                          <td className="p-3">{person.persianName}</td>
                          <td className="p-3 font-mono text-emerald-600">{person.voipNumber}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {person.project}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(person)}
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              >
                                <EditIcon />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(person.personnelCode)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <DeleteIcon />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {editingPerson && (
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-center text-gray-800">
                    ویرایش اطلاعات: {editingPerson.persianName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">کد پرسنلی</label>
                        <Input
                          disabled
                          value={formData.personnelCode}
                          className="text-center border-gray-200 rounded-xl bg-gray-50"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">نام فارسی *</label>
                        <Input
                          required
                          value={formData.persianName}
                          onChange={(e) => setFormData({ ...formData, persianName: e.target.value })}
                          className="text-center border-gray-200 rounded-xl"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">
                          نام انگلیسی *
                        </label>
                        <Input
                          required
                          value={formData.englishName}
                          onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                          className="text-center border-gray-200 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">شماره ویپ *</label>
                        <Input
                          required
                          value={formData.voipNumber}
                          onChange={(e) => setFormData({ ...formData, voipNumber: e.target.value })}
                          className="text-center border-gray-200 rounded-xl"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">پروژه *</label>
                        <Select
                          value={formData.project}
                          onValueChange={(value) => setFormData({ ...formData, project: value })}
                        >
                          <SelectTrigger className="text-center border-gray-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueProjects.map((project) => (
                              <SelectItem key={project} value={project}>
                                {project}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">بخش *</label>
                        <Input
                          required
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="text-center border-gray-200 rounded-xl"
                          dir="rtl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">سمت *</label>
                        <Select
                          value={formData.position}
                          onValueChange={(value) => setFormData({ ...formData, position: value })}
                        >
                          <SelectTrigger className="text-center border-gray-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {uniquePositions.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="border-gray-200 rounded-xl bg-transparent"
                      >
                        انصراف
                      </Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                        به‌روزرسانی
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* File Upload Tab */}
        {activeTab === "upload" && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">بارگذاری فایل اکسل</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onUploadComplete={handleFileUpload} />
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-center text-gray-800">تنظیمات ظاهری برنامه</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">نام شرکت</label>
                    <Input
                      value={appSettings.companyName}
                      onChange={(e) => handleSettingsUpdate("companyName", e.target.value)}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                      placeholder="نام شرکت"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">عنوان برنامه</label>
                    <Input
                      value={appSettings.appTitle}
                      onChange={(e) => handleSettingsUpdate("appTitle", e.target.value)}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                      placeholder="عنوان برنامه"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">رنگ تم</label>
                    <Input
                      type="color"
                      value={appSettings.themeColor}
                      onChange={(e) => handleSettingsUpdate("themeColor", e.target.value)}
                      className="h-12 border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center text-gray-700">اعتبار طراح</label>
                    <Input
                      value={appSettings.designerCredit}
                      onChange={(e) => handleSettingsUpdate("designerCredit", e.target.value)}
                      className="text-center border-gray-200 rounded-xl"
                      dir="rtl"
                      placeholder="طراحی شده توسط..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-center text-gray-700">لوگو شرکت</label>
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={appSettings.logoUrl || "/placeholder.svg"}
                        alt="لوگو فعلی"
                        className="h-16 w-auto border border-gray-200 rounded-lg"
                      />
                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <ImageIcon />
                          انتخاب لوگو جدید
                        </label>
                        {logoFile && (
                          <Button
                            onClick={() => handleLogoUpload(logoFile, "logo")}
                            disabled={isUploading}
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                          >
                            {isUploading ? "در حال آپلود..." : "آپلود لوگو"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-center text-gray-700">فاویکون</label>
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={appSettings.faviconUrl || "/placeholder.svg"}
                        alt="فاویکون فعلی"
                        className="h-8 w-8 border border-gray-200 rounded"
                      />
                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="favicon-upload"
                        />
                        <label
                          htmlFor="favicon-upload"
                          className="cursor-pointer flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <ImageIcon />
                          انتخاب فاویکون جدید
                        </label>
                        {faviconFile && (
                          <Button
                            onClick={() => handleLogoUpload(faviconFile, "favicon")}
                            disabled={isUploading}
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                          >
                            {isUploading ? "در حال آپلود..." : "آپلود فاویکون"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={resetSettings}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
                  >
                    بازگردانی به تنظیمات پیش‌فرض
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-center text-gray-800">تنظیمات سیستم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">اطلاعات حساب کاربری</h3>
                  <p className="text-blue-700 text-sm mb-3">نام کاربری: admin</p>
                  <p className="text-blue-700 text-sm mb-4">رمز عبور: محفوظ و رمزگذاری شده</p>
                  <Button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    تغییر رمز عبور
                  </Button>
                </div>

                {showPasswordChange && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">تغییر رمز عبور</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">
                          رمز عبور جدید
                        </label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="text-center border-gray-200 rounded-xl"
                          dir="rtl"
                          placeholder="حداقل 8 کاراکتر شامل حروف، اعداد و علائم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-center text-gray-700">
                          تکرار رمز عبور
                        </label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="text-center border-gray-200 rounded-xl"
                          dir="rtl"
                          placeholder="تکرار رمز عبور جدید"
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => setShowPasswordChange(false)}
                          variant="outline"
                          className="border-gray-200 rounded-xl"
                        >
                          انصراف
                        </Button>
                        <Button
                          onClick={handlePasswordChange}
                          className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                        >
                          تغییر رمز عبور
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">آمار سیستم</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-700">تعداد کل پرسنل: </span>
                      <span className="font-semibold text-yellow-900">{personnelData.length} نفر</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">تعداد پروژه‌ها: </span>
                      <span className="font-semibold text-yellow-900">{uniqueProjects.length} پروژه</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">تعداد بخش‌ها: </span>
                      <span className="font-semibold text-yellow-900">{uniqueDepartments.length} بخش</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">تعداد سمت‌ها: </span>
                      <span className="font-semibold text-yellow-900">{uniquePositions.length} سمت</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SecurityMonitor onClearAttempts={() => setMessage("تلاش‌های ناموفق پاک شد")} />
          </div>
        )}
      </div>
    </div>
  )
}
