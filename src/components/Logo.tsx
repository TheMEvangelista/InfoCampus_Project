import logoUrl from "@/assets/infocampus-logo.svg";
import { cn } from "@/lib/utils";

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img src={logoUrl} alt="InfoCampus" className="h-8 w-8" />
      {showName && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          <span className="text-secondary">Info</span>
          <span className="text-primary">Campus</span>
        </span>
      )}
    </span>
  );
}
