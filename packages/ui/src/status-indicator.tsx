import { cn } from "@repo/utils";
import type { HTMLAttributes } from "react";

type StatusTone = "ok" | "warning" | "error" | "unknown";

export type StatusIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  unknown: "bg-slate-400",
};

export function StatusIndicator({
  className,
  label,
  tone = "unknown",
  ...props
}: StatusIndicatorProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 text-sm", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn("h-2.5 w-2.5 rounded-full", toneClasses[tone])}
      />
      <span className="text-slate-700">{label}</span>
    </div>
  );
}
