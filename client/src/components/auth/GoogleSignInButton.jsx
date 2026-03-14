import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ redirectTo = "/home", onError, label = "continue_with" }) {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  if (!googleClientId) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        text={label}
        width="320"
        shape="pill"
        theme="outline"
        onSuccess={async (response) => {
          try {
            if (!response.credential) throw new Error("Google sign-in did not return a credential");
            await loginWithGoogle(response.credential);
            navigate(redirectTo, { replace: true });
          } catch (error) {
            onError?.(error.message || "Google sign-in failed");
          }
        }}
        onError={() => onError?.("Google sign-in was cancelled or failed")}
      />
    </div>
  );
}