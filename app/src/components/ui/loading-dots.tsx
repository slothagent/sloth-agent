import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  color?: "default" | "primary" | "white";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-1 w-1",
  md: "h-1.5 w-1.5",
  lg: "h-2 w-2",
};

const colorClasses = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  white: "bg-white",
};

export function LoadingDots({
  className,
  color = "default",
  size = "md",
}: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div
        className={cn(
          "animate-bounce rounded-full",
          sizeClasses[size],
          colorClasses[color],
          "animation-delay-0"
        )}
      />
      <div
        className={cn(
          "animate-bounce rounded-full",
          sizeClasses[size],
          colorClasses[color],
          "animation-delay-150"
        )}
      />
      <div
        className={cn(
          "animate-bounce rounded-full",
          sizeClasses[size],
          colorClasses[color],
          "animation-delay-300"
        )}
      />
    </div>
  );
} 