import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { StarDisplay } from "../components/StarRating";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Users,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/ratings/store");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load store data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-100 dark:bg-[#050505] transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/5 p-8 rounded-3xl text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
            No store assigned
          </h2>
          <p className="text-slate-500 dark:text-gray-500 text-sm leading-relaxed mb-6">
            {error}
          </p>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
            <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
              Action Required
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Contact system administrator to link a store to your profile.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const { store, ratings, averageRating, totalRatings } = data;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#050505] text-slate-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <LayoutDashboard size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                Control Center
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-500 text-sm font-medium tracking-widest uppercase">
              Welcome back,{" "}
              <span className="text-blue-500 dark:text-blue-400">
                {user.name}
              </span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">
                Total Ratings
              </p>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {totalRatings}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl"
            >
              <div className="relative h-48">
                {store.image_url ? (
                  <img
                    src={store.image_url}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                    <Store
                      size={48}
                      className="text-slate-300 dark:text-white/10"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0d0d0d] to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic drop-shadow-lg">
                    {store.name}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-500 mt-1 shrink-0" />
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                    {store.address || "No address registered"}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5 text-center">
                  <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                    {averageRating
                      ? parseFloat(averageRating).toFixed(1)
                      : "0.0"}
                  </div>
                  <div className="flex justify-center mb-2">
                    <StarDisplay rating={parseFloat(averageRating)} size="lg" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em]">
                    Aggregate Rating
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Distribution Card */}
            {totalRatings > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={16} className="text-blue-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Rating Distribution
                  </h3>
                </div>
                <div className="space-y-4">
                  {dist.map(({ star, count }) => {
                    const pct =
                      totalRatings > 0
                        ? Math.round((count / totalRatings) * 100)
                        : 0;
                    return (
                      <div key={star} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-slate-500 dark:text-gray-400">
                            {star} Stars
                          </span>
                          <span className="text-blue-500 dark:text-blue-400">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Reviews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                Customer Feedback
              </h2>
              <div className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full">
                {totalRatings} Total Entries
              </div>
            </div>

            {ratings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-slate-200 dark:border-white/5 p-16 text-center"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users
                    className="text-slate-300 dark:text-gray-700"
                    size={32}
                  />
                </div>
                <p className="text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest text-sm">
                  Awaiting first review
                </p>
                <p className="text-slate-400 dark:text-gray-700 text-xs mt-2 uppercase">
                  Customer ratings will be indexed here automatically.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ratings.map((r, index) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white dark:bg-[#0d0d0d] rounded-2xl border border-slate-200 dark:border-white/5 p-5 flex items-center justify-between gap-4 hover:border-blue-500/30 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/5 font-black text-blue-500 dark:text-blue-400">
                        {r.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                          {r.user_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-tighter">
                            <Calendar size={10} />
                            {new Date(r.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-gray-800 rounded-full" />
                          <span className="text-[10px] text-slate-400 dark:text-gray-700 font-bold tracking-tighter">
                            {r.user_email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 mb-1.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {r.rating}
                        </span>
                        <Star
                          size={12}
                          className="fill-blue-500 text-blue-500"
                        />
                      </div>
                      <StarDisplay rating={r.rating} size="xs" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-20 text-center opacity-30 hover:opacity-100 transition-opacity duration-500 group">
          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-[0.5em] uppercase mb-1">
            Developed by Ambar Ubale
          </p>
          <div className="h-[1px] w-12 bg-blue-600 mx-auto group-hover:w-32 transition-all duration-700" />
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
