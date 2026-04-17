import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FormField from "../components/FormField";
import { validateLoginForm } from "../hooks/useValidation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldAlert, Mail, KeyRound } from "lucide-react";

const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/admin/login", form);
      adminLogin(res.data.token, res.data.user);
      navigate("/admin");
    } catch (err) {
      setServerErr(
        err.response?.data?.message || "Authentication failed. Access Denied.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-red-50 dark:bg-[#050505] px-4 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      {/* Glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-red-900/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-900/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <ShieldAlert
                className="text-red-500 w-10 h-10"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1 text-slate-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="text-red-500/70 font-bold text-[10px] tracking-[0.5em] uppercase">
            Restricted Access Zone
          </p>
        </div>

        {/* Login Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl blur opacity-10 dark:opacity-20 bg-red-600 transition duration-1000 group-hover:opacity-20 dark:group-hover:opacity-30" />

          <div className="relative bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-4">
                {/* Email */}
                <div className="relative group/field space-y-1.5">
                  <label className="text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider ml-1">
                    Admin Email
                  </label>
                  <div className="absolute left-3 top-[38px] text-slate-400 dark:text-gray-600 group-focus-within/field:text-red-500 transition-colors z-10">
                    <Mail size={18} />
                  </div>
                  <FormField
                    label=""
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="admin@storerating.com"
                    className="pl-10 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-xl w-full focus:ring-1 focus:ring-red-500/50 transition-all outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative group/field space-y-1.5">
                  <label className="text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider ml-1">
                    Secret Key
                  </label>
                  <div className="absolute left-3 top-[38px] text-slate-400 dark:text-gray-600 group-focus-within/field:text-red-500 transition-colors z-10">
                    <KeyRound size={18} />
                  </div>
                  <FormField
                    label=""
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    className="pl-10 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-xl w-full focus:ring-1 focus:ring-red-500/50 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {serverErr && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/5 border border-red-500/20 text-red-500 text-[11px] py-2.5 px-4 rounded-lg text-center font-bold tracking-wide"
                  >
                    {serverErr}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-tighter rounded-xl hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Authorize Session"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Credentials Hint */}
        <div className="mt-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 pointer-events-none group-hover:backdrop-blur-none transition-all duration-700" />
          <div className="p-4 text-center">
            <p className="text-[9px] text-slate-400 dark:text-gray-600 uppercase tracking-widest mb-2 font-bold group-hover:text-red-500 transition-colors">
              Emergency Credentials (Hover to Reveal)
            </p>
            <div className="space-y-1 group-hover:opacity-100 opacity-0 transition-opacity duration-500">
              <p className="text-xs text-slate-600 dark:text-gray-400 font-mono">
                admin@storerating.com
              </p>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-mono tracking-widest">
                password
              </p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col items-center opacity-40 hover:opacity-100 transition-all duration-500">
            <p className="text-[10px] font-medium text-slate-400 dark:text-gray-400 tracking-widest uppercase">
              Ambar Ubale
            </p>
            <p className="text-[8px] text-red-600 font-black uppercase tracking-[0.4em]">
              Security Auditor
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
