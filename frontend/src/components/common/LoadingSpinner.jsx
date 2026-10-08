import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({
  message = "Loading...",
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-neutral-400 gap-3 ${className}`}
    >
      <Loader2
        className={`animate-spin text-neutral-200 ${sizeMap[size] || sizeMap.md}`}
      />
      {message && <p className="text-sm font-medium text-neutral-400">{message}</p>}
    </div>
  );
};
