export type ClassValue = string | number | boolean | undefined | null | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  return inputs.flat().filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
}

export function toPersianNumbers(input: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

  let result = String(input)
  for (let i = 0; i < englishDigits.length; i++) {
    result = result.replace(new RegExp(englishDigits[i], "g"), persianDigits[i])
  }
  return result
}
