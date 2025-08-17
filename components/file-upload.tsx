"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  processExcelFile,
  validateFileType,
  downloadSampleCSV,
  generateExcelTemplate,
  type FileUploadResult,
  type ImportFilters,
} from "@/lib/file-utils"

const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const FileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

interface FileUploadProps {
  onUploadComplete: (result: FileUploadResult) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importFilters, setImportFilters] = useState<ImportFilters>({
    projectFilter: "all",
    departmentFilter: "all",
    positionFilter: "all",
    skipDuplicates: true,
    updateExisting: false,
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const validation = validateFileType(file)
    if (!validation.valid) {
      setUploadResult({
        success: false,
        message: validation.message,
        added: 0,
        updated: 0,
        skipped: 0,
        errors: [validation.message],
      })
      return
    }

    setSelectedFile(file)
    setUploadResult(null)
    setUploadProgress(0)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      const result = await processExcelFile(selectedFile, importFilters)
      setUploadProgress(100)
      setUploadResult(result)
      onUploadComplete(result)
    } catch (error) {
      const errorResult: FileUploadResult = {
        success: false,
        message: `خطا در پردازش فایل: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
        added: 0,
        updated: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "خطای نامشخص"],
      }
      setUploadResult(errorResult)
      onUploadComplete(errorResult)
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Sample File Download */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">دانلود فایل نمونه CSV</h3>
                <p className="text-sm text-blue-700">فرمت ساده و سازگار با همه نرم‌افزارها</p>
              </div>
              <Button
                onClick={downloadSampleCSV}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
              >
                <DownloadIcon />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900 mb-1">دانلود قالب اکسل</h3>
                <p className="text-sm text-green-700">شامل راهنما و نمونه داده</p>
              </div>
              <Button
                onClick={generateExcelTemplate}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
              >
                <DownloadIcon />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-right text-gray-800">فیلترهای وارد کردن</CardTitle>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="border-gray-300 bg-transparent"
            >
              <FilterIcon />
              {showFilters ? "مخفی کردن فیلترها" : "نمایش فیلترها"}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-center text-gray-700">فیلتر پروژه</label>
                <Select
                  value={importFilters.projectFilter}
                  onValueChange={(value) => setImportFilters({ ...importFilters, projectFilter: value })}
                >
                  <SelectTrigger className="text-center border-gray-200 rounded-xl">
                    <SelectValue placeholder="همه پروژه‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه پروژه‌ها</SelectItem>
                    <SelectItem value="فولاد مبارکه">فولاد مبارکه</SelectItem>
                    <SelectItem value="پتروشیمی">پتروشیمی</SelectItem>
                    <SelectItem value="نفت و گاز">نفت و گاز</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-center text-gray-700">فیلتر بخش</label>
                <Select
                  value={importFilters.departmentFilter}
                  onValueChange={(value) => setImportFilters({ ...importFilters, departmentFilter: value })}
                >
                  <SelectTrigger className="text-center border-gray-200 rounded-xl">
                    <SelectValue placeholder="همه بخش‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه بخش‌ها</SelectItem>
                    <SelectItem value="مهندسی">مهندسی</SelectItem>
                    <SelectItem value="تولید">تولید</SelectItem>
                    <SelectItem value="کیفیت">کیفیت</SelectItem>
                    <SelectItem value="ایمنی">ایمنی</SelectItem>
                    <SelectItem value="نگهداری">نگهداری</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-center text-gray-700">فیلتر سمت</label>
                <Select
                  value={importFilters.positionFilter}
                  onValueChange={(value) => setImportFilters({ ...importFilters, positionFilter: value })}
                >
                  <SelectTrigger className="text-center border-gray-200 rounded-xl">
                    <SelectValue placeholder="همه سمت‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه سمت‌ها</SelectItem>
                    <SelectItem value="مهندس">مهندس</SelectItem>
                    <SelectItem value="تکنسین">تکنسین</SelectItem>
                    <SelectItem value="اپراتور">اپراتور</SelectItem>
                    <SelectItem value="کارشناس">کارشناس</SelectItem>
                    <SelectItem value="مسئول ایمنی">مسئول ایمنی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="skipDuplicates"
                  checked={importFilters.skipDuplicates}
                  onChange={(e) => setImportFilters({ ...importFilters, skipDuplicates: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="skipDuplicates" className="text-sm text-gray-700">
                  رد کردن رکوردهای تکراری
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="updateExisting"
                  checked={importFilters.updateExisting}
                  onChange={(e) => setImportFilters({ ...importFilters, updateExisting: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="updateExisting" className="text-sm text-gray-700">
                  به‌روزرسانی رکوردهای موجود
                </label>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>توجه:</strong> فیلترها فقط روی داده‌های وارد شده اعمال می‌شوند. اگر فیلتری انتخاب کنید، فقط
                رکوردهایی که با آن فیلتر مطابقت دارند وارد خواهند شد.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* File Upload Area */}
      <Card className="border-0 shadow-sm bg-white rounded-2xl">
        <CardHeader>
          <CardTitle className="text-right text-gray-800">بارگذاری فایل پرسنل</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? "border-emerald-400 bg-emerald-50"
                : selectedFile
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FileIcon />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">فایل انتخاب شد</h3>
                  <p className="text-green-700 mb-1">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">حجم: {(selectedFile.size / 1024).toFixed(1)} کیلوبایت</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {selectedFile.name.split(".").pop()?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {selectedFile.type || "نامشخص"}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button onClick={handleUpload} disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700">
                    {isUploading ? `در حال پردازش... ${uploadProgress}%` : "بارگذاری فایل"}
                  </Button>
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    disabled={isUploading}
                    className="border-gray-300 bg-transparent"
                  >
                    انصراف
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <UploadIcon />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">فایل را اینجا رها کنید یا کلیک کنید</h3>
                  <p className="text-gray-600 mb-4">فرمت‌های پشتیبانی شده: CSV, Excel (.xlsx, .xls)</p>
                  <p className="text-sm text-gray-500 mb-6">حداکثر حجم فایل: 5 مگابایت</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer transition-colors"
                >
                  <UploadIcon />
                  انتخاب فایل
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card
          className={`border-0 shadow-sm rounded-2xl ${
            uploadResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${uploadResult.success ? "bg-green-100" : "bg-red-100"}`}>
                {uploadResult.success ? <CheckIcon className="text-green-600" /> : <XIcon className="text-red-600" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${uploadResult.success ? "text-green-800" : "text-red-800"}`}>
                  {uploadResult.success ? "بارگذاری موفقیت‌آمیز" : "خطا در بارگذاری"}
                </h3>
                <p className={`mb-3 ${uploadResult.success ? "text-green-700" : "text-red-700"}`}>
                  {uploadResult.message}
                </p>

                {/* Enhanced Results Summary */}
                {uploadResult.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{uploadResult.summary.totalRows}</div>
                      <div className="text-sm text-gray-600">کل ردیف‌ها</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{uploadResult.added}</div>
                      <div className="text-sm text-gray-600">اضافه شده</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">{uploadResult.updated}</div>
                      <div className="text-sm text-gray-600">به‌روزرسانی</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-gray-600">{uploadResult.skipped}</div>
                      <div className="text-sm text-gray-600">رد شده</div>
                    </div>
                  </div>
                )}

                {uploadResult.errors.length > 0 && (
                  <div className="bg-red-100 p-3 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                      <XIcon className="w-4 h-4" />
                      خطاها ({uploadResult.errors.length}):
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      {uploadResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {uploadResult.errors.length > 10 && (
                        <li className="font-medium">... و {uploadResult.errors.length - 10} خطای دیگر</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Instructions */}
      <Card className="border-0 shadow-sm bg-gray-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-right text-gray-800 flex items-center gap-2">
            <AnalyticsIcon />
            راهنمای کامل بارگذاری
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">فرمت‌های پشتیبانی شده:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <h5 className="font-medium text-blue-800 mb-2">CSV (توصیه شده)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• سازگاری کامل</li>
                    <li>• پردازش سریع</li>
                    <li>• پشتیبانی از UTF-8</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <h5 className="font-medium text-green-800 mb-2">Excel (.xlsx)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• فرمت جدید اکسل</li>
                    <li>• پشتیبانی محدود</li>
                    <li>• تبدیل به CSV</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <h5 className="font-medium text-orange-800 mb-2">Excel (.xls)</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• فرمت قدیمی اکسل</li>
                    <li>• پشتیبانی محدود</li>
                    <li>• تبدیل به CSV</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-gray-800">ستون‌های اجباری:</h4>
              <div className="bg-white p-3 rounded-lg border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <Badge variant="outline" className="justify-center">
                    کد پرسنلی
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    نام فارسی
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    نام انگلیسی
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    شماره ویپ
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    پروژه
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    بخش
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    سمت
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-gray-800">نکات مهم:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>ردیف اول باید شامل عناوین ستون‌ها باشد</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>کد پرسنلی و شماره ویپ باید منحصر به فرد باشند</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>تمام فیلدها اجباری هستند</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>از فیلترها برای وارد کردن انتخابی استفاده کنید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>در صورت خطا، فقط ردیف‌های صحیح اضافه می‌شوند</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>حداکثر حجم فایل: 5 مگابایت</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
