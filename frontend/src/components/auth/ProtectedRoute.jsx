import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCognitoAuth } from "@/hooks/useCognitoAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isAuthenticated: isCognitoAuth, isLoading: cognitoLoading } = useCognitoAuth();
  const location = useLocation();

  if (loading || cognitoLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Checking authentication..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated && !isCognitoAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
