import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ErrorState = ({
  title = "Something went wrong",
  message = "Failed to load data. Please try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-lg border border-destructive/30 bg-destructive/10 text-center max-w-md mx-auto my-6 transition-colors ${className}`}
    >
      <div className="p-3 rounded-full bg-destructive/20 text-destructive mb-3 border border-destructive/30">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-border bg-card hover:bg-muted text-foreground text-xs flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};
