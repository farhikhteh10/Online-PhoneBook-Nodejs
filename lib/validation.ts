import type { PersonnelData } from "./personnel-data"

export const validatePersonnelData = (person: Partial<PersonnelData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!person.personnelCode?.trim()) {
    errors.push("کد پرسنلی الزامی است")
  } else if (!/^\d+$/.test(person.personnelCode)) {
    errors.push("کد پرسنلی باید فقط شامل اعداد باشد")
  }

  if (!person.persianName?.trim()) {
    errors.push("نام فارسی الزامی است")
  }

  if (!person.englishName?.trim()) {
    errors.push("نام انگلیسی الزامی است")
  }

  if (!person.voipNumber?.trim()) {
    errors.push("شماره ویپ الزامی است")
  } else if (!/^\d+$/.test(person.voipNumber)) {
    errors.push("شماره ویپ باید فقط شامل اعداد باشد")
  }

  if (!person.project?.trim()) {
    errors.push("پروژه الزامی است")
  }

  if (!person.department?.trim()) {
    errors.push("بخش الزامی است")
  }

  if (!person.position?.trim()) {
    errors.push("سمت الزامی است")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, "")
}

export const validateFileSize = (file: File, maxSizeMB = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some((type) => file.type === type || file.name.toLowerCase().endsWith(type.replace("*", "")))
}
