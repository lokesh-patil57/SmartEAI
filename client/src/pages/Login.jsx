import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const googleAuthEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-sm">
        <h1 className="text-xl font-black text-slate-900 mb-1">Login</h1>
        <p className="text-slate-600 text-[13px] mb-4">
          Sign in to access your resumes and documents.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full text-[13px] h-9"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-[13px] h-9"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2369EB] hover:bg-[#1a5fd4] text-white h-9 text-xs"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {googleAuthEnabled && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>Or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <GoogleSignInButton
              redirectTo="/home"
              onError={setError}
              label="signin_with"
            />
          </>
        )}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-[#2369EB] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
