import { cn } from "../../lib/utils";
import { Loader } from "./loader";

interface LoadingOverlayProps {
  className?: string;
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  blur?: boolean;
  opacity?: "low" | "medium" | "high";
}

const opacityClasses = {
  low: "bg-background/50",
  medium: "bg-background/70",
  high: "bg-background/90",
};

export function LoadingOverlay({
  className,
  isLoading,
  children,
  text,
  blur = true,
  opacity = "medium",
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center z-10",
            opacityClasses[opacity],
            blur && "backdrop-blur-sm"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <Loader size="lg" variant="primary" />
            {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
          </div>
        </div>
      )}
    </div>
  );
} 