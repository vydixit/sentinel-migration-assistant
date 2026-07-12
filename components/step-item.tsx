"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Step } from "@/lib/data/components";
import { PermissionChip, RefLink } from "./chips";
import { cn } from "@/lib/utils";

export function StepItem({
  step,
  index,
  done,
  onToggle,
}: {
  step: Step;
  index: number;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-3 transition-colors",
        done ? "border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/5" : "border-border bg-card"
      )}
    >
      <button
        onClick={onToggle}
        aria-label={done ? "Mark step incomplete" : "Mark step complete"}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-white"
            : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {done && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-pop-in">
            <Check className="h-4 w-4" />
          </motion.span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", done && "text-muted-foreground line-through")}>
          <span className="mr-1 font-semibold text-foreground">Step {index}:</span>
          {step.text}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {step.permission && <PermissionChip role={step.permission} />}
          {step.ref && <RefLink label={step.ref.label} url={step.ref.url} />}
        </div>
      </div>
    </div>
  );
}
