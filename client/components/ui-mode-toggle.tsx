"use client";

import { Laptop2, Paintbrush2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiMode } from "@/context/ui-mode";

export function UiModeToggle({
  className,
  title = "Interface mode",
  description = "Switch between the classic product UI and the newer redesigned surfaces.",
}: {
  className?: string;
  title?: string;
  description?: string;
}) {
  const { uiMode, setUiMode } = useUiMode();

  return (
    <div className={cn("rounded-[24px] border-2 border-dashed border-hand-pencil/20 bg-hand-paper p-4", className)}>
      <p className="font-kalam text-3xl font-bold text-hand-pencil">{title}</p>
      <p className="mt-1 font-patrick text-lg text-hand-pencil/70">{description}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          {
            key: "classic" as const,
            label: "Classic UI",
            note: "Keep the familiar LMS layout and existing surface style.",
            icon: Laptop2,
          },
          {
            key: "new" as const,
            label: "New UI",
            note: "Use the redesigned paper-board and hand-crafted interface.",
            icon: Paintbrush2,
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = uiMode === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setUiMode(item.key)}
              className={cn(
                "rounded-[22px] border-[3px] p-4 text-left transition-transform hover:-translate-y-0.5",
                active
                  ? "border-hand-pencil bg-hand-yellow shadow-hard-sm"
                  : "border-hand-pencil/20 bg-white shadow-sm"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-[16px] border-2 border-hand-pencil bg-white p-2.5 text-hand-pencil">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-kalam text-2xl font-bold text-hand-pencil">{item.label}</p>
                  <p className="font-patrick text-base text-hand-pencil/65">{item.note}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
