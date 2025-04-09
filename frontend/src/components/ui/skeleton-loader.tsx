import { cn } from "../../lib/utils";
import { Skeleton } from "./skeleton";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  inline?: boolean;
}

export function SkeletonLoader({
  className,
  count = 1,
  height = "1rem",
  width = "100%",
  circle = false,
  inline = false,
}: SkeletonLoaderProps) {
  const skeletons = Array(count)
    .fill(0)
    .map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          circle ? "rounded-full" : "rounded-md",
          inline ? "inline-block" : "block",
          className
        )}
        style={{
          height,
          width,
          marginBottom: i < count - 1 ? "0.5rem" : 0,
        }}
      />
    ));

  return <>{skeletons}</>;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
} 