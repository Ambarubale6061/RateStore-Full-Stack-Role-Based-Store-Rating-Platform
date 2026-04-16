import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FormField from "../components/FormField";
import { validateLoginForm } from "../hooks/useValidation";

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
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-1">Restricted access</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <FormField
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="admin@example.com"
              required
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            {serverErr && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm px-4 py-3 rounded-lg">
                {serverErr}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? "Authenticating…" : "Admin Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">
          Secure admin access only
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
