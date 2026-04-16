import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
