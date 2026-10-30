
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser } from "../services/authService";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(
    searchParams.get("signup") === "true"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (isSignup) {
      if (!name.trim()) {
        setMessage("Please enter your name.");
        return;
      }

      if (password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
      }
    }

    try {
      setLoading(true);

      if (isSignup) {
        await registerUser({
          name: name.trim(),
          email: normalizedEmail,
          password,
        });
      }

      // Login after registration or directly for existing users
      await loginUser({
        email: normalizedEmail,
        password,
      });

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup((previous) => !previous);
    setMessage("");
    setShowPassword(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-7 shadow-xl sm:p-9">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Activity size={25} />
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {isSignup
            ? "Start building healthier habits today."
            : "Sign in to continue your fitness journey."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {isSignup && (
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete={
                  isSignup ? "new-password" : "current-password"
                }
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-violet-700"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {message && (
            <p
              role="alert"
              className="rounded-xl bg-violet-50 p-3 text-sm text-violet-700"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignup
            ? "Already have an account?"
            : "New to FitTrack?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-violet-700 hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

        <p className="mt-5 text-center text-xs text-gray-400">
          Secure authentication powered by FitTrack backend.
        </p>
      </div>
    </div>
  );
}
