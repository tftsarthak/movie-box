import { useAuth } from "react-oidc-context";

export const useCognitoAuth = () => {
  const oidcAuth = useAuth();

  const clientId =
    import.meta.env.VITE_COGNITO_CLIENT_ID || "5h474s8pqu97qqv5qlhosbvv6m";
  const cognitoDomain =
    import.meta.env.VITE_COGNITO_DOMAIN ||
    "https://us-east-1gpzgef52w.auth.us-east-1.amazoncognito.com";
  const logoutUri = `${window.location.origin}/login`;

  /**
   * Initiates an authorization request with Cognito User Pool OIDC provider
   */
  const signIn = async () => {
    return oidcAuth.signinRedirect();
  };

  /**
   * Initiates a logout request clearing both local tokens and Cognito Hosted UI session
   */
  const signOut = async () => {
    try {
      await oidcAuth.removeUser();
    } catch (err) {
      console.warn("Failed to clear local OIDC user:", err);
    }
    // Redirect to Cognito Hosted UI /logout endpoint to revoke session cookies
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return {
    ...oidcAuth,
    user: oidcAuth.user,
    email: oidcAuth.user?.profile?.email,
    name: oidcAuth.user?.profile?.name || oidcAuth.user?.profile?.["cognito:username"],
    isAuthenticated: Boolean(oidcAuth.isAuthenticated),
    isLoading: oidcAuth.isLoading,
    error: oidcAuth.error,
    signIn,
    signOut,
  };
};

export default useCognitoAuth;
