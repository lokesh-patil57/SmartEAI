import { useAuthContext } from "../contexts/useAuthContext";

export function useAuth() {
  const { isLoggedIn, user, login, signup, loginWithGoogle, logout, refreshUser } = useAuthContext();
  return {
    isLoggedIn,
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshUser,
    setIsLoggedIn: () => {}, // no-op; use logout() to clear session
  };
}
