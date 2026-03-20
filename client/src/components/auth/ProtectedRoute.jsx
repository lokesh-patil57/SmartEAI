import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProtectedRoute - Protects routes that require authentication
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected component to render
 * @param {boolean} props.requireAuth - If true, redirects to login if not authenticated
 */
export function ProtectedRoute({ children, requireAuth = true }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (requireAuth) {
    // User must be logged in to access this route
    if (!isLoggedIn) {
      // Redirect to landing page to satisfy user request "logout -> landing page"
      return <Navigate to="/" replace />;
    }
  } else {
    // User must NOT be logged in (e.g., login page)
    if (isLoggedIn) {
      // Redirect to dashboard (or the page they were trying to access)
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

/**
 * GuestRoute - Routes that should only be accessible when NOT logged in
 * (e.g., login page, register page)
 */
export function GuestRoute({ children }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}
