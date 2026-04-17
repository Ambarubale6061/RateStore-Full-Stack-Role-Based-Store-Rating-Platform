import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import StarRating, { StarDisplay } from "../components/StarRating";
import Modal from "../components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Store,
  MapPin,
  Star,
  X,
  ChevronRight,
  Edit3,
  Plus,
} from "lucide-react";

const StoreImage = ({ url, name }) => {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return (
      <div className="w-full h-44 bg-slate-100 dark:bg-[#111] flex items-center justify-center rounded-t-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50" />
        <Store
          className="text-slate-300 dark:text-gray-700 group-hover:scale-110 transition-transform duration-500"
          size={48}
          strokeWidth={1}
        />
      </div>
    );
  }
  return (
    <div className="w-full h-44 overflow-hidden rounded-t-2xl">
      <img
        src={url}
        alt={name}
        onError={() => setBroken(true)}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
    </div>
  );
};

const StoreCard = ({ store, onRate }) => {
  const avg = store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group bg-white dark:bg-[#0d0d0d] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all duration-300 shadow-xl overflow-hidden"
    >
      <StoreImage url={store.image_url} name={store.name} />

      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              {store.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-slate-500 dark:text-gray-500">
              <MapPin size={14} className="shrink-0 text-blue-500" />
              <p className="text-xs truncate font-medium uppercase tracking-tight">
                {store.address || "No location provided"}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {avg ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                  <span className="text-lg font-black text-blue-500 dark:text-blue-400">
                    {avg}
                  </span>
                  <Star size={16} className="fill-blue-400 text-blue-400" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-tighter mt-1">
                  {store.total_ratings} Reviews
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-700 border border-slate-200 dark:border-white/5 px-2 py-1 rounded-md uppercase">
                New Store
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest">
              Your Status
            </span>
            {store.my_rating ? (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-bold text-amber-500">
                  {store.my_rating}
                </span>
                <StarDisplay rating={store.my_rating} size="xs" />
              </div>
            ) : (
              <span className="text-xs font-medium text-slate-400 dark:text-gray-600 mt-0.5 italic">
                Not rated
              </span>
            )}
          </div>

          {onRate && (
            <button
              onClick={() => onRate(store)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
            >
              {store.my_rating ? <Edit3 size={14} /> : <Plus size={14} />}
              {store.my_rating ? "Refine" : "Rate"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RatingModal = ({ store, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (store) setRating(store.my_rating || 0);
  }, [store]);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (store.my_rating) {
        await api.put("/ratings", { store_id: store.id, rating });
      } else {
        await api.post("/ratings", { store_id: store.id, rating });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Experience Feedback"
      size="sm"
    >
      <div className="flex flex-col items-center gap-6 py-4">
        {store.image_url && (
          <div className="relative w-full h-32 overflow-hidden rounded-2xl">
            <img
              src={store.image_url}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <h4 className="text-lg font-black text-white uppercase tracking-widest px-4 text-center">
                {store.name}
              </h4>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">
            Select Rating
          </p>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <AnimatePresence>
          {rating > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full"
            >
              <span className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                {
                  ["", "Terrible", "Poor", "Average", "Good", "Excellent"][
                    rating
                  ]
                }
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-tighter">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !rating}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20"
        >
          {loading
            ? "Transmitting..."
            : store.my_rating
              ? "Update Review"
              : "Commit Rating"}
        </button>
      </div>
    </Modal>
  );
};

const StoreListPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sortBy, order };
      if (search) params.search = search;
      const res = await api.get("/stores", { params });
      setStores(res.data.stores);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to load stores", err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order, search]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#050505] text-slate-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Store Explorer
            </h1>
          </div>
          <p className="text-slate-500 dark:text-gray-500 text-sm font-medium tracking-[0.1em]">
            {total} PREMIUM ENTITIES DISCOVERED
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-[#111] p-2 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-2 mb-10 shadow-xl">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Query by name or location..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                  className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex gap-2 p-1">
            {[
              ["name", "Alphabetical"],
              ["avg_rating", "Rating"],
            ].map(([field, label]) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  sortBy === field
                    ? "bg-blue-600/10 border-blue-500/50 text-blue-500 dark:text-blue-400"
                    : "bg-transparent border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300"
                }`}
              >
                {label}
                {sortBy === field &&
                  (order === "asc" ? (
                    <ChevronRight className="-rotate-90" size={12} />
                  ) : (
                    <ChevronRight className="rotate-90" size={12} />
                  ))}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24">
            <LoadingSpinner />
          </div>
        ) : stores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white dark:bg-[#0d0d0d] rounded-3xl border border-slate-200 dark:border-white/5"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="text-slate-300 dark:text-gray-700" size={40} />
            </div>
            <p className="text-xl font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              No entities found
            </p>
            <p className="text-slate-400 dark:text-gray-600 text-xs mt-2 uppercase tracking-tighter">
              Adjust your search parameters and try again
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onRate={
                  user?.role === "USER"
                    ? (s) => {
                        setSelectedStore(s);
                        setRatingModalOpen(true);
                      }
                    : null
                }
              />
            ))}
          </div>
        )}

        <div className="mt-12">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Branding Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-all duration-500 group">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-slate-400 dark:via-gray-500 to-transparent group-hover:via-blue-500 transition-all duration-700 mb-2" />
            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-400 tracking-[0.4em] uppercase">
              Ambar Ubale
            </p>
            <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.6em]">
              System Administrator
            </p>
          </div>
        </div>
      </div>

      <RatingModal
        store={selectedStore}
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSuccess={fetchStores}
      />
    </div>
  );
};

export default StoreListPage;
