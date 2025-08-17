"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, Info } from "lucide-react"
import {
  processExcelFile,
  validateFileType,
  downloadSampleCSV,
  generateExcelTemplate,
  type FileUploadResult,
  type ImportFilters,
} from "@/lib/file-utils"
import { 
    getAllPersonnel, 
    getUniqueProjects, 
    getUniqueDepartments, 
    getUniquePositions,
    type Project,
    type Department,
    type Position,
    type PersonnelData
} from "@/lib/personnel-data"

export function ExcelImportExport() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<FileUploadResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // State for lookup data
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);

  // Fetch lookup data on mount
  useEffect(() => {
    const fetchData = async () => {
        const [projs, depts, pos, pers] = await Promise.all([
            getUniqueProjects(),
            getUniqueDepartments(),
            getUniquePositions(),
            getAllPersonnel()
        ]);
        setProjects(projs);
        setDepartments(depts);
        setPositions(pos);
        setPersonnel(pers);
    };
    fetchData();
  }, []);

  // Import filters
  const [filters, setFilters] = useState<ImportFilters>({
    projectFilter: "all",
    departmentFilter: "all",
    positionFilter: "all",
    skipDuplicates: true,
    updateExisting: false,
  })

  // Export options
  const [exportFilters, setExportFilters] = useState({
    project: "all",
    department: "all",
    position: "all",
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFileType(selectedFile)
    if (!validation.valid) {
      setResult({
        success: false,
        message: validation.message,
        added: 0,
        updated: 0,
        skipped: 0,
        errors: [validation.message],
      })
      return
    }

    setFile(selectedFile)
    setResult(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const uploadResult = await processExcelFile(file, filters)
      setResult(uploadResult)
      setUploadProgress(100)

      if (uploadResult.success) {
        setFile(null)
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      }
    } catch (error) {
      setResult({
        success: false,
        message: `خطا در پردازش فایل: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
        added: 0,
        updated: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "خطای نامشخص"],
      })
      setUploadProgress(100)
    } finally {
      setUploading(false)
      clearInterval(progressInterval)
    }
  }

  const handleExport = () => {
    let filteredData = personnel;

    if (exportFilters.project !== "all") {
      filteredData = filteredData.filter((p) => p.project === exportFilters.project)
    }
    if (exportFilters.department !== "all") {
      filteredData = filteredData.filter((p) => p.department === exportFilters.department)
    }
    if (exportFilters.position !== "all") {
      filteredData = filteredData.filter((p) => p.position === exportFilters.position)
    }

    const filename = `personnel-export-${new Date().toISOString().split("T")[0]}.csv`
    
    const csvContent = [
      "کد پرسنلی,نام فارسی,نام انگلیسی,شماره ویپ,پروژه,بخش,سمت",
      ...filteredData.map(
        (p) =>
          `${p.personnelCode},${p.persianName},${p.englishName},${p.voipNumber},${p.project},${p.department},${p.position}`,
      ),
    ].join("\n")

    const blob = new Blob([`\ufeff${csvContent}`], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            وارد کردن از فایل اکسل
          </CardTitle>
          <CardDescription>فایل‌های CSV، XLS و XLSX را وارد کنید. حداکثر حجم: 5 مگابایت</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>فیلتر پروژه</Label>
              <Select
                value={filters.projectFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, projectFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه پروژه‌ها</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>فیلتر بخش</Label>
              <Select
                value={filters.departmentFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, departmentFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه بخش‌ها</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="skip-duplicates"
                checked={filters.skipDuplicates}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, skipDuplicates: checked }))}
              />
              <Label htmlFor="skip-duplicates">رد کردن تکراری‌ها</Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="update-existing"
                checked={filters.updateExisting}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, updateExisting: checked }))}
              />
              <Label htmlFor="update-existing">بروزرسانی موجود</Label>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">{file ? file.name : "فایل را اینجا بکشید یا کلیک کنید"}</p>
              <p className="text-sm text-muted-foreground">CSV، XLS، XLSX - حداکثر 5MB</p>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                انتخاب فایل
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>در حال پردازش...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
              {uploading ? "در حال پردازش..." : "وارد کردن داده‌ها"}
            </Button>
            {file && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  const fileInput = document.getElementById("file-upload") as HTMLInputElement
                  if (fileInput) fileInput.value = ""
                }}
              >
                لغو
              </Button>
            )}
          </div>

          {/* Upload Result */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className="text-sm">
                    <div className="font-medium mb-2">{result.message}</div>
                    {result.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <Badge variant="outline">کل: {result.summary.totalRows}</Badge>
                        <Badge variant="outline" className="bg-green-100">
                          اضافه شده: {result.added}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100">
                          بروزرسانی: {result.updated}
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-100">
                          رد شده: {result.skipped}
                        </Badge>
                      </div>
                    )}
                    {result.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        <div className="font-medium">خطاها:</div>
                        <ul className="list-disc list-inside">
                          {result.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {result.errors.length > 5 && <li>... و {result.errors.length - 5} خطای دیگر</li>}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            خروجی به فایل اکسل
          </CardTitle>
          <CardDescription>داده‌های پرسنل را به فرمت CSV صادر کنید</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>فیلتر پروژه</Label>
              <Select
                value={exportFilters.project}
                onValueChange={(value) => setExportFilters((prev) => ({ ...prev, project: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه پروژه‌ها</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>فیلتر بخش</Label>
              <Select
                value={exportFilters.department}
                onValueChange={(value) => setExportFilters((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه بخش‌ها</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>فیلتر سمت</Label>
              <Select
                value={exportFilters.position}
                onValueChange={(value) => setExportFilters((prev) => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه سمت‌ها</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.name}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              صادر کردن داده‌ها
            </Button>
            <Button variant="outline" onClick={downloadSampleCSV} className="flex items-center gap-2 bg-transparent">
              <FileSpreadsheet className="h-4 w-4" />
              دانلود نمونه CSV
            </Button>
            <Button
              variant="outline"
              onClick={generateExcelTemplate}
              className="flex items-center gap-2 bg-transparent"
            >
              <FileSpreadsheet className="h-4 w-4" />
              دانلود قالب اکسل
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <div className="font-medium">راهنمای استفاده:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>برای وارد کردن داده‌ها، ابتدا قالب اکسل را دانلود کنید</li>
                  <li>فیلدهای اجباری: کد پرسنلی، نام فارسی، نام انگلیسی، شماره ویپ، پروژه، بخش، سمت</li>
                  <li>کد پرسنلی و شماره ویپ باید منحصر به فرد باشند</li>
                  <li>فایل‌های اکسل به صورت خودکار به CSV تبدیل می‌شوند</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
