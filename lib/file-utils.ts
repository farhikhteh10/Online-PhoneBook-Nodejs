import { type PersonnelData, addMultiplePersonnel } from "./personnel-data"

export interface FileUploadResult {
  success: boolean
  message: string
  added: number
  errors: string[]
  data?: PersonnelData[]
}

export const parseCSVContent = (content: string): PersonnelData[] => {
  const lines = content.split("\n").filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error("فایل باید حداقل یک ردیف هدر و یک ردیف داده داشته باشد")
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const data: PersonnelData[] = []

  // Expected headers mapping
  const headerMap: { [key: string]: keyof PersonnelData } = {
    "کد پرسنلی": "personnelCode",
    personnel_code: "personnelCode",
    personnelCode: "personnelCode",
    "نام فارسی": "persianName",
    persian_name: "persianName",
    persianName: "persianName",
    "نام انگلیسی": "englishName",
    english_name: "englishName",
    englishName: "englishName",
    "شماره ویپ": "voipNumber",
    voip_number: "voipNumber",
    voipNumber: "voipNumber",
    پروژه: "project",
    project: "project",
    بخش: "department",
    department: "department",
    سمت: "position",
    position: "position",
  }

  // Map headers to our data structure
  const mappedHeaders = headers.map((header) => {
    const mapped = headerMap[header.toLowerCase()] || headerMap[header]
    if (!mapped) {
      console.warn(`Unknown header: ${header}`)
    }
    return mapped
  })

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`)
      continue
    }

    const person: Partial<PersonnelData> = {}

    mappedHeaders.forEach((header, index) => {
      if (header && values[index]) {
        person[header] = values[index]
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
      data.push(person as PersonnelData)
    } else {
      console.warn(`Row ${i + 1} missing required fields:`, person)
    }
  }

  return data
}

export const processExcelFile = async (file: File): Promise<FileUploadResult> => {
  try {
    // For now, we'll handle Excel files as CSV since we don't have xlsx library
    // In a real implementation, you'd use a library like xlsx or exceljs
    const text = await file.text()

    // Try to parse as CSV first
    if (file.name.endsWith(".csv") || file.type === "text/csv") {
      const data = parseCSVContent(text)
      const result = addMultiplePersonnel(data)

      return {
        success: result.success,
        message: result.message,
        added: result.added,
        errors: result.errors,
        data,
      }
    } else {
      // For Excel files, we'll provide instructions for now
      return {
        success: false,
        message: "لطفاً فایل اکسل را به فرمت CSV تبدیل کنید. در اکسل: File > Save As > CSV",
        added: 0,
        errors: ["فرمت Excel پشتیبانی نمی‌شود، لطفاً از CSV استفاده کنید"],
        data: [],
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `خطا در پردازش فایل: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      added: 0,
      errors: [error instanceof Error ? error.message : "خطای نامشخص"],
      data: [],
    }
  }
}

export const validateFileType = (file: File): { valid: boolean; message: string } => {
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

  return { valid: true, message: "" }
}

export const generateSampleCSV = (): string => {
  const headers = ["کد پرسنلی", "نام فارسی", "نام انگلیسی", "شماره ویپ", "پروژه", "بخش", "سمت"]

  const sampleData = [
    ["1001", "علی احمدی", "Ali Ahmadi", "2001", "پروژه نمونه", "بخش فنی", "کارشناس"],
    ["1002", "فاطمه رضایی", "Fatemeh Rezaei", "2002", "پروژه نمونه", "بخش اداری", "کارمند"],
    ["1003", "محمد حسینی", "Mohammad Hosseini", "2003", "پروژه نمونه", "بخش مالی", "حسابدار"],
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
  }
}
