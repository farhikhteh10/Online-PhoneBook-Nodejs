"use client";

import { type PersonnelData, addPersonnel, updatePersonnel } from "./personnel-data"
import { SecurityUtils } from "./security-utils"

export interface FileUploadResult {
  success: boolean
  message: string
  added: number
  updated: number
  skipped: number
  errors: string[]
  data?: Omit<PersonnelData, 'id'>[]
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

export const parseCSVContent = (content: string): Omit<PersonnelData, 'id'>[] => {
  const lines = content.split("\n").filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error("فایل باید حداقل یک ردیف هدر و یک ردیف داده داشته باشد")
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/["\uFEFF]/g, ""))
  const data: Omit<PersonnelData, 'id'>[] = []

  const headerMap: { [key: string]: keyof Omit<PersonnelData, 'id'> } = {
    "کد پرسنلی": "personnelCode",
    "نام فارسی": "persianName",
    "نام انگلیسی": "englishName",
    "شماره ویپ": "voipNumber",
    "پروژه": "project",
    "بخش": "department",
    "سمت": "position",
  }

  const mappedHeaders = headers.map((header) => headerMap[header.toLowerCase().trim()] || headerMap[header]);

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length !== headers.length) continue;

    const person: Partial<Omit<PersonnelData, 'id'>> = {}
    mappedHeaders.forEach((header, index) => {
      if (header) {
        person[header] = SecurityUtils.sanitizeInput(values[index])
      }
    });
    
    data.push(person as Omit<PersonnelData, 'id'>);
  }

  return data;
}


export const processExcelFile = async (file: File, filters: ImportFilters): Promise<FileUploadResult> => {
  const content = await file.text();
  const parsedData = parseCSVContent(content);

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const person of parsedData) {
      if (filters.updateExisting) {
          const result = await updatePersonnel(person.personnelCode, person);
          if (result.success) updated++;
          else errors.push(result.message);
      } else {
          const result = await addPersonnel(person);
          if (result.success) added++;
          else {
              if (result.message.includes("تکراری")) skipped++;
              else errors.push(result.message);
          }
      }
  }

  return {
      success: added > 0 || updated > 0,
      message: `${added} پرسنل اضافه شد، ${updated} به‌روزرسانی شد، ${skipped} رد شد.`,
      added,
      updated,
      skipped,
      errors,
      summary: {
          totalRows: parsedData.length,
          validRows: added + updated,
          duplicates: skipped,
          invalidRows: errors.length
      }
  };
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

  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      message: "حجم فایل نباید بیشتر از 5 مگابایت باشد.",
    }
  }

  return { valid: true, message: "" }
}

export const downloadSampleCSV = () => {
  const headers = ["کد پرسنلی", "نام فارسی", "نام انگلیسی", "شماره ویپ", "پروژه", "بخش", "سمت"]
  const sampleData = [
    ["1001", "علی احمدی", "Ali Ahmadi", "2001", "فولاد مبارکه", "مهندسی", "مهندس"],
    ["1002", "فاطمه رضایی", "Fatemeh Rezaei", "2002", "پتروشیمی", "تولید", "تکنسین"],
  ]
  const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.setAttribute("download", "نمونه-فایل-پرسنل.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const generateExcelTemplate = () => {
    downloadSampleCSV();
}
