import { Film } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Film,
  title = "No movies found",
  message = "Try adjusting your search or filters to find what you're looking for.",
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-lg border border-border bg-card max-w-lg mx-auto my-8 transition-colors shadow-sm ${className}`}
    >
      <div className="p-3.5 rounded-full bg-muted border border-border text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
