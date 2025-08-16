import type * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "flex h-11 w-full min-w-0 border-2 bg-white dark:bg-gray-900 px-4 py-3 text-base font-medium",
        "shadow-sm transition-all duration-200 outline-none rounded-xl",
        "text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "border-gray-300 dark:border-gray-600",

        "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg",
        "hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md",

        "text-base sm:text-sm md:text-base lg:text-sm xl:text-base",
        "min-h-[44px] sm:min-h-[40px] md:min-h-[44px]", // Touch-friendly on mobile

        "aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-800",

        "file:inline-flex file:h-8 file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium file:px-3 file:py-1 file:rounded-lg file:mr-3",
        "dark:file:bg-blue-900/30 dark:file:text-blue-300",

        className,
      )}
      {...props}
    />
  )
}

export { Input }
