import { Link } from "react-router";
import { UserPlus } from "lucide-react";

export const SignupPage = () => {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-border bg-card p-8 text-center transition-colors shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-border text-foreground mb-4">
          <UserPlus className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Create an account</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Start building your film catalog and favorites list.
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Registration will be wired up in Phase 5.
        </p>
        <div className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline font-medium hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
