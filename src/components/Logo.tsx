import logoUrl from "@/assets/infocampus-logo.svg";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showName = true,
  iconClassName,
  nameClassName,
}: {
  className?: string;
  showName?: boolean;
  iconClassName?: string;
  nameClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img src={logoUrl} alt="InfoCampus" className={cn("h-8 w-8", iconClassName)} />
      {showName && (
        <span
          className={cn(
            "font-display text-lg font-extrabold tracking-tight",
            nameClassName,
          )}
        >
          <span className="text-secondary">Info</span>
          <span className="text-primary">Campus</span>
        </span>
      )}
    </span>
  );
}
