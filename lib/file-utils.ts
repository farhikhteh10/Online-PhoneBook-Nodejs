import { type PersonnelData, addMultiplePersonnel } from "./personnel-data"
import { SecurityUtils } from "./security-utils"

export interface FileUploadResult {
  success: boolean
  message: string
  added: number
  updated: number
  skipped: number
  errors: string[]
  data?: PersonnelData[]
  summary?: {
    totalRows: number
    validRows: number
    duplicates: number
    invalidRows: number
  }
}

export interface ImportFilters {
  projectFilter: string
  departmentFilter: string
  positionFilter: string
  skipDuplicates: boolean
  updateExisting: boolean
}

export const parseCSVContent = (content: string, filters?: ImportFilters): PersonnelData[] => {
  const lines = content.split("\n").filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error("فایل باید حداقل یک ردیف هدر و یک ردیف داده داشته باشد")
  }

  // Enhanced header detection with multiple language support
  const headers = lines[0].split(",").map((h) => h.trim().replace(/["\uFEFF]/g, ""))
  const data: PersonnelData[] = []

  // Comprehensive header mapping for Persian, English, and mixed formats
  const headerMap: { [key: string]: keyof PersonnelData } = {
    "کد پرسنلی": "personnelCode",
    "کد پرسنل": "personnelCode",
    "شماره پرسنلی": "personnelCode",
    personnel_code: "personnelCode",
    personnelCode: "personnelCode",
    "personnel code": "personnelCode",
    id: "personnelCode",
    "نام فارسی": "persianName",
    نام: "persianName",
    persian_name: "persianName",
    persianName: "persianName",
    "persian name": "persianName",
    name_fa: "persianName",
    "نام انگلیسی": "englishName",
    english_name: "englishName",
    englishName: "englishName",
    "english name": "englishName",
    name_en: "englishName",
    name: "englishName",
    "شماره ویپ": "voipNumber",
    "شماره داخلی": "voipNumber",
    "تلفن داخلی": "voipNumber",
    voip_number: "voipNumber",
    voipNumber: "voipNumber",
    "voip number": "voipNumber",
    extension: "voipNumber",
    phone: "voipNumber",
    پروژه: "project",
    project: "project",
    "project name": "project",
    بخش: "department",
    department: "department",
    "department name": "department",
    واحد: "department",
    unit: "department",
    سمت: "position",
    position: "position",
    "job title": "position",
    title: "position",
    مقام: "position",
    role: "position",
  }

  // Map headers to our data structure
  const mappedHeaders = headers.map((header) => {
    const normalizedHeader = header.toLowerCase().trim()
    const mapped = headerMap[normalizedHeader] || headerMap[header]
    if (!mapped) {
      console.warn(`Unknown header: ${header}`)
    }
    return mapped
  })

  // Validate that we have all required headers
  const requiredFields: (keyof PersonnelData)[] = [
    "personnelCode",
    "persianName",
    "englishName",
    "voipNumber",
    "project",
    "department",
    "position",
  ]

  const missingFields = requiredFields.filter((field) => !mappedHeaders.includes(field))
  if (missingFields.length > 0) {
    throw new Error(`فیلدهای اجباری یافت نشد: ${missingFields.join(", ")}`)
  }

  for (let i = 1; i < lines.length; i++) {
    try {
      // Enhanced CSV parsing to handle quoted values and commas within fields
      const values = parseCSVLine(lines[i])

      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`)
        continue
      }

      const person: Partial<PersonnelData> = {}

      mappedHeaders.forEach((header, index) => {
        if (header && values[index]) {
          // Sanitize input for security
          person[header] = SecurityUtils.sanitizeInput(values[index])
        }
      })

      // Validate required fields
      if (
        person.personnelCode &&
        person.persianName &&
        person.englishName &&
        person.voipNumber &&
        person.project &&
        person.department &&
        person.position
      ) {
        // Apply filters if provided
        if (filters && !passesFilters(person as PersonnelData, filters)) {
          continue
        }

        // Additional validation
        const validation = SecurityUtils.validatePersonnelData(person)
        if (validation.isValid) {
          data.push(person as PersonnelData)
        } else {
          console.warn(`Row ${i + 1} validation failed:`, validation.errors)
        }
      } else {
        console.warn(`Row ${i + 1} missing required fields:`, person)
      }
    } catch (error) {
      console.warn(`Error parsing row ${i + 1}:`, error)
    }
  }

  return data
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ""
      i++
    } else {
      current += char
      i++
    }
  }

  result.push(current.trim())
  return result
}

const passesFilters = (person: PersonnelData, filters: ImportFilters): boolean => {
  if (filters.projectFilter !== "all" && person.project !== filters.projectFilter) {
    return false
  }
  if (filters.departmentFilter !== "all" && person.department !== filters.departmentFilter) {
    return false
  }
  if (filters.positionFilter !== "all" && person.position !== filters.positionFilter) {
    return false
  }
  return true
}

export const processExcelFile = async (file: File, filters?: ImportFilters): Promise<FileUploadResult> => {
  try {
    // Security validation
    const fileValidation = SecurityUtils.validateFile(file)
    if (!fileValidation.isValid) {
      return {
        success: false,
        message: fileValidation.errors.join(", "),
        added: 0,
        updated: 0,
        skipped: 0,
        errors: fileValidation.errors,
      }
    }

    let content: string

    if (file.name.endsWith(".csv") || file.type === "text/csv") {
      content = await file.text()
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // For Excel files, we'll use a client-side Excel parser
      content = await parseExcelFile(file)
    } else {
      return {
        success: false,
        message: "فرمت فایل پشتیبانی نمی‌شود",
        added: 0,
        updated: 0,
        skipped: 0,
        errors: ["فرمت فایل نامعتبر"],
      }
    }

    const data = parseCSVContent(content, filters)
    const totalRows = data.length

    if (totalRows === 0) {
      return {
        success: false,
        message: "هیچ داده معتبری در فایل یافت نشد",
        added: 0,
        updated: 0,
        skipped: 0,
        errors: ["فایل خالی یا فاقد داده معتبر"],
      }
    }

    // Process data with enhanced options
    const result = addMultiplePersonnel(data, {
      skipDuplicates: filters?.skipDuplicates ?? true,
      updateExisting: filters?.updateExisting ?? false,
    })

    return {
      success: result.success,
      message: result.message,
      added: result.added,
      updated: result.updated || 0,
      skipped: result.skipped || 0,
      errors: result.errors,
      data,
      summary: {
        totalRows,
        validRows: data.length,
        duplicates: result.skipped || 0,
        invalidRows: totalRows - data.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `خطا در پردازش فایل: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : "خطای نامشخص"],
    }
  }
}

const parseExcelFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer
        const workbook = parseExcelBuffer(data)
        const csvContent = convertWorkbookToCSV(workbook)
        resolve(csvContent)
      } catch (error) {
        reject(new Error("خطا در پردازش فایل اکسل. لطفاً فایل را به فرمت CSV تبدیل کنید."))
      }
    }

    reader.onerror = () => {
      reject(new Error("خطا در خواندن فایل"))
    }

    reader.readAsArrayBuffer(file)
  })
}

const parseExcelBuffer = (buffer: ArrayBuffer): any => {
  // This is a simplified implementation
  // In a production environment, you would use a library like xlsx or exceljs
  const view = new Uint8Array(buffer)

  // Check for Excel file signatures
  const xlsxSignature = [0x50, 0x4b, 0x03, 0x04] // ZIP signature (XLSX)
  const xlsSignature = [0xd0, 0xcf, 0x11, 0xe0] // OLE signature (XLS)

  const isXLSX = xlsxSignature.every((byte, index) => view[index] === byte)
  const isXLS = xlsSignature.every((byte, index) => view[index] === byte)

  if (!isXLSX && !isXLS) {
    throw new Error("فایل اکسل معتبر نیست")
  }

  // For now, return a placeholder that will trigger CSV conversion request
  return {
    type: isXLSX ? "xlsx" : "xls",
    data: buffer,
  }
}

const convertWorkbookToCSV = (workbook: any): string => {
  // Simplified conversion - in reality, this would parse the Excel structure
  throw new Error(
    "برای پردازش فایل‌های اکسل، لطفاً آن‌ها را به فرمت CSV تبدیل کنید. در اکسل: File > Save As > CSV (UTF-8)",
  )
}

export const validateFileType = (file: File): { valid: boolean; message: string } => {
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/csv",
    "text/plain",
  ]

  const allowedExtensions = [".csv", ".xls", ".xlsx"]
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      message: "فرمت فایل پشتیبانی نمی‌شود. لطفاً فایل CSV، XLS یا XLSX انتخاب کنید.",
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      message: "حجم فایل نباید بیشتر از 5 مگابایت باشد.",
    }
  }

  // Check minimum file size
  if (file.size < 10) {
    return {
      valid: false,
      message: "فایل خالی یا خراب است.",
    }
  }

  return { valid: true, message: "" }
}

export const generateSampleCSV = (): string => {
  const headers = ["کد پرسنلی", "نام فارسی", "نام انگلیسی", "شماره ویپ", "پروژه", "بخش", "سمت"]

  const sampleData = [
    ["1001", "علی احمدی", "Ali Ahmadi", "2001", "فولاد مبارکه", "مهندسی", "مهندس"],
    ["1002", "فاطمه رضایی", "Fatemeh Rezaei", "2002", "پتروشیمی", "تولید", "تکنسین"],
    ["1003", "محمد حسینی", "Mohammad Hosseini", "2003", "نفت و گاز", "کیفیت", "کارشناس"],
    ["1004", "زهرا کریمی", "Zahra Karimi", "2004", "فولاد مبارکه", "ایمنی", "مسئول ایمنی"],
    ["1005", "حسن موسوی", "Hassan Mousavi", "2005", "پتروشیمی", "نگهداری", "اپراتور"],
  ]

  const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

  return csvContent
}

export const downloadSampleCSV = () => {
  const csvContent = generateSampleCSV()
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "نمونه-فایل-پرسنل.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const exportPersonnelToCSV = (data: PersonnelData[], filename?: string): void => {
  const headers = ["کد پرسنلی", "نام فارسی", "نام انگلیسی", "شماره ویپ", "پروژه", "بخش", "سمت"]

  const csvRows = data.map((person) => [
    person.personnelCode,
    person.persianName,
    person.englishName,
    person.voipNumber,
    person.project,
    person.department,
    person.position,
  ])

  const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename || `personnel-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const generateExcelTemplate = (): void => {
  const headers = ["کد پرسنلی", "نام فارسی", "نام انگلیسی", "شماره ویپ", "پروژه", "بخش", "سمت"]
  const instructions = [
    "راهنما: این فایل نمونه برای وارد کردن اطلاعات پرسنل است",
    "لطفاً ردیف‌های راهنما را حذف کرده و اطلاعات خود را وارد کنید",
    "تمام فیلدها اجباری هستند",
    "کد پرسنلی و شماره ویپ باید منحصر به فرد باشند",
    "",
    "",
  ]

  const sampleData = [
    ["1001", "علی احمدی", "Ali Ahmadi", "2001", "فولاد مبارکه", "مهندسی", "مهندس"],
    ["1002", "فاطمه رضایی", "Fatemeh Rezaei", "2002", "پتروشیمی", "تولید", "تکنسین"],
  ]

  const csvContent = [...instructions, headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "قالب-اکسل-پرسنل.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
