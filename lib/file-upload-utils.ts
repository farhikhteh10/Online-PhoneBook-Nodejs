"use client";

export const uploadFile = async (file: File, type: "logo" | "favicon"): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        // In a real app, this would upload to a server. For now, we use localStorage.
        const key = `uploaded-${type}-${Date.now()}`
        localStorage.setItem(key, result)
        resolve(result)
      } else {
        reject(new Error("Failed to read file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export const validateImageFile = (file: File): Promise<{ valid: boolean; error?: string }> => {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return Promise.resolve({ valid: false, error: "فایل باید تصویر باشد" });
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return Promise.resolve({ valid: false, error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" });
  }

  // Check image dimensions
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.width > 2000 || img.height > 2000) {
        resolve({ valid: false, error: "ابعاد تصویر نباید بیشتر از ۲۰۰۰ پیکسل باشد" })
      } else {
        resolve({ valid: true })
      }
    }
    img.onerror = () => {
      resolve({ valid: false, error: "فایل تصویر معتبر نیست" })
    }
    img.src = URL.createObjectURL(file)
  })
}
