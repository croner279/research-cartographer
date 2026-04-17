"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Archive,
  BookOpenText,
  Files,
  FlaskConical,
  HelpCircle,
  Home,
  Radar,
  Shapes,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceTransferPanel } from "@/components/workspace-transfer-panel";
import { useWorkspace } from "@/components/workspace-provider";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Emerging Radar", icon: Radar },
  { href: "/topics", label: "Topic Drafts", icon: Shapes },
  { href: "/waves", label: "Wave Board", icon: Waves },
  { href: "/queue", label: "Research Queue", icon: Files },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/evidence", label: "Evidence Workspace", icon: BookOpenText },
  { href: "/questions", label: "Question Board", icon: HelpCircle },
  { href: "/missed-winners", label: "Missed Winners Lab", icon: FlaskConical },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { resetWorkspace } = useWorkspace();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-[280px_1fr] gap-6 px-4 py-4">
        <aside className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[32px] border border-border bg-sidebar px-5 py-6 shadow-card">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-white">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Research Cartographer</p>
              <p className="text-xs text-muted-foreground">개인 리서치 구조 맵</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active
                      ? "bg-white font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[28px] border border-border/80 bg-white/65 p-3">
            <div className="rounded-[22px] border border-border bg-white/80 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Workspace
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                현재 세션의 로컬 워크스페이스를 관리합니다.
              </p>
              <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={resetWorkspace}>
                워크스페이스 초기화
              </Button>
            </div>
            <WorkspaceTransferPanel />
          </div>
        </aside>

        <main className="rounded-[32px] border border-border bg-panel px-8 py-6 shadow-card backdrop-blur">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-5">
            <div>
              <p className="text-sm font-medium text-foreground">Desktop-first Research Studio</p>
              <p className="text-sm text-muted-foreground">
                읽은 것을 구조로 바꾸는 개인 투자 리서치 OS
              </p>
            </div>
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground">
              Local-first workspace
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
