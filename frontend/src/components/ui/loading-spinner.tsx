import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "white";
}

const sizeClasses = {
  sm: "h-3 w-3 border-[1.5px]",
  md: "h-4 w-4 border-2",
  lg: "h-6 w-6 border-2",
};

const colorClasses = {
  default: "border-muted-foreground/50 border-t-muted-foreground",
  primary: "border-primary/30 border-t-primary",
  white: "border-white/30 border-t-white",
};

export function LoadingSpinner({
  className,
  size = "md",
  color = "default",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
} 