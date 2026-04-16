import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
