"use client";
import { useState } from "react";
import { useFormik } from "formik";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema } from "../schemas/loginSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ShieldAlert,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setError(null);
      try {
        const res = await signIn("credentials", {
          ...values,
          redirect: false,
        });
        if (res?.error) {
          setError("Invalid email or password");
        } else {
          router.push("/dashboard");
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight-bg text-white selection:bg-midnight-primary/30 selection:text-white font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Glow Orb 1 */}
        <div className="absolute top-[-40%] left-[-20%] h-[80%] w-[80%] rounded-full bg-linear-to-br from-midnight-primary/15 to-transparent blur-[120px]" />
        {/* Glow Orb 2 */}
        <div className="absolute bottom-[-40%] right-[-20%] h-[80%] w-[80%] rounded-full bg-linear-to-tr from-midnight-secondary/10 to-transparent blur-[120px]" />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141a22_1px,transparent_1px),linear-gradient(to_bottom,#141a22_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] px-6 py-12">
        {/* The entire login panel content wraps inside one single unified card border/box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-midnight-border bg-midnight-surface/85 py-6 px-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Brand/Logo Header */}
          <div className="flex flex-col items-center text-center mb-5">
            {/* Logo image rendered clean with NO container box (no borders/backgrounds) */}
            <Image
              src="/careerflow.png"
              alt="CareerFlow Logo"
              width={140}
              height={140}
              priority
              className="object-contain animate-fade-in mb-[-22px]"
            />
            <h1 className="mt-0 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Career<span className="text-midnight-secondary">Flow</span>
            </h1>
            <p className="text-sm text-midnight-muted mt-1">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="space-y-3.5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-white"
                >
                  Email address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-midnight-muted/60">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`pl-10 bg-midnight-bg border-midnight-border focus:border-midnight-primary focus:ring-midnight-primary/20 text-white placeholder:text-midnight-muted/40 rounded-xl transition-all duration-200 ${
                      formik.touched.email && formik.errors.email
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                        : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {formik.touched.email && formik.errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-rose-500 flex items-center gap-1 mt-1"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      {formik.errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-white"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-midnight-muted/60">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`pl-10 pr-10 bg-midnight-bg border-midnight-border focus:border-midnight-primary focus:ring-midnight-primary/20 text-white placeholder:text-midnight-muted/40 rounded-xl transition-all duration-200 ${
                      formik.touched.password && formik.errors.password
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                        : ""
                    }`}
                  />
                  {/* Show/Hide password toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-midnight-muted/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {formik.touched.password && formik.errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-rose-500 flex items-center gap-1 mt-1"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      {formik.errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Server-side / General Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-500"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full h-11 bg-midnight-primary hover:bg-[#4676E5] text-white font-semibold rounded-xl shadow-lg shadow-midnight-primary/10 hover:shadow-midnight-primary/20 border-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
