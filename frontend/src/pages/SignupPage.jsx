import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FormField from "../components/FormField";
import { validateSignupForm } from "../hooks/useValidation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User,
  MapPin,
} from "lucide-react";

const SignupPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((errs) => ({ ...errs, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErr("");
    const errs = validateSignupForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      login(res.data.token, res.data.user);
      navigate("/stores");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length) {
        const fieldErrors = {};
        serverErrors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerErr(
          err.response?.data?.message || "Signup failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-blue-50 dark:bg-[#0a0a0a] px-4 py-12 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] z-10 space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/30 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="text-white w-10 h-10" strokeWidth={1.5} />
            </div>
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-blue-500 dark:text-blue-400/80 font-bold text-[12px] tracking-[0.3em] uppercase">
            Get Started
          </p>
        </div>

        {/* Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl blur opacity-20 dark:opacity-25 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-1000 bg-gradient-to-r from-blue-500 to-indigo-500" />

          <div className="relative bg-white dark:bg-[#0d1117]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="space-y-4">
                {/* Full Name */}
                <div className="relative group/field space-y-1.5">
                  <label className="text-sm text-slate-600 dark:text-gray-400 font-medium block">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <div className="absolute left-3 top-[41px] text-slate-400 dark:text-gray-500 group-focus-within/field:text-blue-500 transition-colors z-10">
                    <User size={18} strokeWidth={1.5} />
                  </div>
                  <FormField
                    label=""
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Ambar Ubale"
                    className="pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-xl w-full focus:ring-2 focus:ring-blue-500/50 transition-all text-base outline-none"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative group/field space-y-1.5">
                  <label className="text-sm text-slate-600 dark:text-gray-400 font-medium block">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <div className="absolute left-3 top-[41px] text-slate-400 dark:text-gray-500 group-focus-within/field:text-blue-500 transition-colors z-10">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <FormField
                    label=""
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="name@company.com"
                    className="pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-xl w-full focus:ring-2 focus:ring-blue-500/50 transition-all text-base outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative group/field space-y-1.5">
                  <label className="text-sm text-slate-600 dark:text-gray-400 font-medium block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="absolute left-3 top-[41px] text-slate-400 dark:text-gray-500 group-focus-within/field:text-blue-500 transition-colors z-10">
                    <Lock size={18} strokeWidth={1.5} />
                  </div>
                  <FormField
                    label=""
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    className="pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-xl w-full focus:ring-2 focus:ring-blue-500/50 transition-all text-base outline-none"
                    required
                  />
                </div>

                {/* Address */}
                <div className="relative group/field space-y-1.5">
                  <label className="text-sm text-slate-600 dark:text-gray-400 font-medium block">
                    Address
                  </label>
                  <div className="absolute left-3 top-[41px] text-slate-400 dark:text-gray-500 group-focus-within/field:text-blue-500 transition-colors z-10">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <FormField
                    label=""
                    name="address"
                    type="textarea"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="Your location details..."
                    className="pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-xl w-full focus:ring-2 focus:ring-blue-500/50 transition-all text-base min-h-[100px] outline-none"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {serverErr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {serverErr}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group/btn shadow-[0_4px_14px_0_rgba(0,118,255,0.4)] mt-2"
              >
                <div className="relative z-10 flex items-center justify-center gap-2 text-base font-bold">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus
                        className="w-5 h-5 group-hover/btn:scale-110 transition-transform"
                        strokeWidth={2.5}
                      />
                      <span>Create Account</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4 text-center"
        >
          <div className="inline-flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-slate-400 dark:via-gray-500 to-transparent mb-1" />
            <p className="text-[11px] font-medium text-slate-400 dark:text-gray-400 tracking-widest uppercase">
              Ambar Ubale
            </p>
            <p className="text-[9px] text-blue-500/70 font-bold uppercase tracking-[0.2em]">
              Full Stack Developer
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
