import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useCognitoAuth } from "@/hooks/useCognitoAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";

export const CallbackPage = () => {
  const { isAuthenticated, isLoading, error, user, signIn } = useCognitoAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const email = user?.profile?.email || "User";
      toast.success(`Welcome, ${email}!`, { id: "cognito-login" });
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <ErrorState
          title="Authentication Failed"
          message={error.message || "Could not complete sign in with Cognito."}
          onRetry={() => {
            signIn();
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Completing authentication with MovieBox..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <LoadingSpinner message="Redirecting..." size="lg" />
    </div>
  );
};

export default CallbackPage;
