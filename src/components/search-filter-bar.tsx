"use client";

import { Input } from "@/components/ui/input";

export function SearchFilterBar({
  query,
  onQueryChange,
  placeholder,
  secondary,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-panel p-4 shadow-card xl:flex-row xl:items-center">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="xl:max-w-lg"
      />
      {secondary ? <div className="xl:ml-auto">{secondary}</div> : null}
    </div>
  );
}
