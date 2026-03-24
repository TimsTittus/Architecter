import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-base text-white transition-all outline-none placeholder:text-zinc-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 appearance-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
