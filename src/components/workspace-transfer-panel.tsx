"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-provider";

export function WorkspaceTransferPanel() {
  const { exportWorkspace, importWorkspace } = useWorkspace();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importWorkspace(file);
    setMessage(result.message);
    event.target.value = "";
  }

  return (
    <div className="mt-4 rounded-[24px] border border-border bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Transfer
      </p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        로컬 워크스페이스를 JSON으로 내보내거나 다른 PC에서 가져옵니다.
      </p>
      <div className="mt-4 grid gap-2">
        <Button variant="secondary" size="sm" className="w-full" onClick={exportWorkspace}>
          워크스페이스 내보내기
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          워크스페이스 가져오기
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => void handleImport(event)}
        />
      </div>
      {message ? <p className="mt-3 text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
