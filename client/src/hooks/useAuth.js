import { useAuthContext } from "../contexts/AuthContext";

export function useAuth() {
  const { isLoggedIn, user, login, signup, logout, refreshUser } = useAuthContext();
  return {
    isLoggedIn,
    user,
    login,
    signup,
    logout,
    refreshUser,
    setIsLoggedIn: () => {}, // no-op; use logout() to clear session
  };
}
