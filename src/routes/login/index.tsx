import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../lib/auth-context";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Lock, User, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

function LoginPage() {
  const { admin, token, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && token && admin) {
      navigate({ to: "/" });
    }
  }, [isLoading, token, admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    const success = await login(username.trim(), password);
    setIsSubmitting(false);

    if (success) {
      navigate({ to: "/" });
    } else {
      setErrorMessage("Invalid credentials. Try username: ADMIN and password: ADMIN");
    }
  };

  const handleQuickFillAdmin = () => {
    setUsername("ADMIN");
    setPassword("ADMIN");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0E0F12] text-[#FDFBF7] flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden selection:bg-[#E5C985]/30 selection:text-[#E5C985]">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#C5A059]/15 via-transparent to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#8E702D]/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-[-10%] w-[350px] h-[350px] rounded-full bg-[#1C1E24]/60 blur-[90px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] z-10 my-auto py-8">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-4 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#1C1E24] to-[#121317] border border-[#2A2D35] flex items-center justify-center p-3.5 shadow-2xl shadow-black/80 transition-all duration-300 group-hover:border-[#C5A059]/40 group-hover:shadow-[#C5A059]/10">
              <img
                src="/images/rolex-logo-transparent.png"
                alt="Rolex Caterers"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.35)]"
              />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#C5A059] flex items-center justify-center text-black shadow-md shadow-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent">
            ROLEX
          </h1>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C5A059]/80 font-medium mt-1">
            Events & Caterers Operations
          </p>
          <p className="text-xs text-stone-400 mt-2 max-w-[280px]">
            Royal Feast Management & Banquet Control Suite
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#141519]/90 backdrop-blur-xl border border-[#252830] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/90">
          <div className="flex items-center justify-between border-b border-[#252830] pb-4 mb-6">
            <div>
              <h2 className="text-base font-medium text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                Administrative Access
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">Enter credentials to proceed</p>
            </div>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="text-[11px] font-mono text-[#C5A059] hover:text-[#E5C985] bg-[#C5A059]/10 hover:bg-[#C5A059]/20 px-2.5 py-1 rounded-md border border-[#C5A059]/30 transition-colors"
              title="Click to fill ADMIN / ADMIN"
            >
              Quick Demo Fill
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2">
              <span className="text-red-400 font-bold shrink-0">!</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Username
              </Label>
              <div className="relative">
                <Input
                  id="admin-username"
                  type="text"
                  autoCapitalize="characters"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ADMIN"
                  required
                  className="bg-[#0A0B0D] border-[#2A2D35] text-stone-100 text-sm focus-visible:ring-1 focus-visible:ring-[#C5A059] focus-visible:border-[#C5A059] h-11 px-3.5 rounded-xl transition-all placeholder:text-stone-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-[#0A0B0D] border-[#2A2D35] text-stone-100 text-sm focus-visible:ring-1 focus-visible:ring-[#C5A059] focus-visible:border-[#C5A059] h-11 px-3.5 pr-10 rounded-xl transition-all placeholder:text-stone-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="pt-1">
              <div className="rounded-lg bg-[#18191E] border border-[#2A2D35] p-2.5 text-[11px] text-stone-400 flex items-center justify-between">
                <span>Default Access:</span>
                <span className="font-mono text-[#C5A059] font-medium tracking-wide">
                  ADMIN / ADMIN
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#8E702D] text-black font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#8E702D]/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] border-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} Rolex Events & Caterers. Internal Management Only.</p>
        </div>
      </div>
    </div>
  );
}
