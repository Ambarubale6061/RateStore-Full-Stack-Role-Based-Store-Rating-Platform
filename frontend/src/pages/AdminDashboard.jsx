import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { StarDisplay } from "../components/StarRating";
import { validateUserForm } from "../hooks/useValidation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  Search,
  Plus,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Camera,
  X,
  Mail,
  MapPin,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="relative overflow-hidden bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-xl group"
  >
    <div
      className={`absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-10 rounded-full ${color}`}
    />
    <div className="flex items-center gap-5 relative z-10">
      <div
        className={`p-4 rounded-xl ${color} bg-opacity-10 text-white shadow-inner`}
      >
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value ?? "0"}
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mt-1">
          {label}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Sort Button ──────────────────────────────────────────────────────────────
const SortBtn = ({ field, current, order, onClick, children }) => (
  <button
    onClick={() => onClick(field)}
    className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
      current === field
        ? "text-blue-500"
        : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
    }`}
  >
    {children}
    {current === field && (
      <span>
        {order === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </span>
    )}
  </button>
);

// ─── Image Upload Widget ──────────────────────────────────────────────────────
const ImagePicker = ({ onChange, preview, setPreview }) => {
  const fileRef = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">
        Store Image
      </label>
      <div
        onClick={() => fileRef.current.click()}
        className="group relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 text-center"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover rounded-xl shadow-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <Camera className="text-white" />
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ImageIcon className="text-slate-400 dark:text-gray-500 group-hover:text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-500 font-medium">
              Click to upload (JPEG, PNG, WebP)
            </p>
            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1 uppercase tracking-tighter">
              Max size 5MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onChange(null);
            fileRef.current.value = "";
          }}
          className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-wider hover:text-red-400 mt-1"
        >
          <X size={12} /> Remove image
        </button>
      )}
    </div>
  );
};

// ─── Add User Modal ───────────────────────────────────────────────────────────
const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
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
    const errs = validateUserForm(form);
    if (!form.password) errs.password = "Password is required.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/users", form);
      onSuccess();
      onClose();
      setForm({ name: "", email: "", password: "", address: "", role: "USER" });
    } catch (err) {
      setServerErr(err.response?.data?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New User">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
        <FormField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Enter name..."
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="user@example.com"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          placeholder="••••••••"
        />
        <FormField
          label="Address"
          name="address"
          type="textarea"
          value={form.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="Enter physical address..."
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">
            Access Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          >
            <option value="USER">Standard User</option>
            <option value="ADMIN">Platform Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>

        {serverErr && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs rounded-xl font-medium">
            {serverErr}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {loading ? "Processing..." : "Provision Account"}
        </button>
      </form>
    </Modal>
  );
};

// ─── Add Store Modal ──────────────────────────────────────────────────────────
const AddStoreModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [owners, setOwners] = useState([]);
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api
        .get("/admin/users", { params: { role: "STORE_OWNER", limit: 100 } })
        .then((res) => setOwners(res.data.users))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setServerErr("Store name is required.");
      return;
    }
    setLoading(true);
    setServerErr("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.email) formData.append("email", form.email);
      if (form.address) formData.append("address", form.address);
      if (form.owner_id) formData.append("owner_id", form.owner_id);
      if (imageFile) formData.append("image", imageFile);
      await api.post("/admin/stores", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onClose();
      setForm({ name: "", email: "", address: "", owner_id: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setServerErr(err.response?.data?.message || "Failed to create store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Establish New Store">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
        <FormField
          label="Store Identity"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Store Name"
        />
        <FormField
          label="Business Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="store@example.com"
        />
        <FormField
          label="Operational Address"
          name="address"
          type="textarea"
          value={form.address}
          onChange={handleChange}
          placeholder="Full address details..."
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest ml-1">
            Assigned Owner
          </label>
          <select
            name="owner_id"
            value={form.owner_id}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          >
            <option value="">— Unassigned —</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
        </div>

        <ImagePicker
          onChange={setImageFile}
          preview={imagePreview}
          setPreview={setImagePreview}
        />

        {serverErr && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs rounded-xl font-medium">
            {serverErr}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {loading ? "Initializing..." : "Launch Store"}
        </button>
      </form>
    </Modal>
  );
};

// ─── Store Image Manager Modal ────────────────────────────────────────────────
const StoreImageModal = ({ store, isOpen, onClose, onSuccess }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(store?.image_url || null);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    if (store) setImagePreview(store.image_url || null);
    setImageFile(null);
    setServerErr("");
  }, [store]);

  const handleUpload = async () => {
    if (!imageFile) return;
    setLoading(true);
    setServerErr("");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      await api.put(`/admin/stores/${store.id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServerErr(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove the store image?")) return;
    setLoading(true);
    try {
      await api.delete(`/admin/stores/${store.id}/image`);
      onSuccess();
      onClose();
    } catch (err) {
      setServerErr(err.response?.data?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gallery — ${store.name}`}
      size="sm"
    >
      <div className="space-y-6 py-2">
        <ImagePicker
          onChange={setImageFile}
          preview={imagePreview}
          setPreview={setImagePreview}
        />
        {serverErr && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs rounded-xl">
            {serverErr}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !imageFile}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Commit Changes"}
          </button>
          {store.image_url && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-3 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-all font-bold text-xs uppercase"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [userSortBy, setUserSortBy] = useState("created_at");
  const [userOrder, setUserOrder] = useState("desc");
  const [addUserOpen, setAddUserOpen] = useState(false);

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesPage, setStoresPage] = useState(1);
  const [storesTotalPages, setStoresTotalPages] = useState(1);
  const [storeSearch, setStoreSearch] = useState({ name: "", address: "" });
  const [storeSortBy, setStoreSortBy] = useState("created_at");
  const [storeOrder, setStoreOrder] = useState("desc");
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [imageModalStore, setImageModalStore] = useState(null);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: {
          ...userSearch,
          page: usersPage,
          limit: 10,
          sortBy: userSortBy,
          order: userOrder,
        },
      });
      setUsers(res.data.users);
      setUsersTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, usersPage, userSortBy, userOrder]);

  const fetchStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const res = await api.get("/admin/stores", {
        params: {
          ...storeSearch,
          page: storesPage,
          limit: 10,
          sortBy: storeSortBy,
          order: storeOrder,
        },
      });
      setStores(res.data.stores);
      setStoresTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setStoresLoading(false);
    }
  }, [storeSearch, storesPage, storeSortBy, storeOrder]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab, fetchUsers]);
  useEffect(() => {
    if (activeTab === "stores") fetchStores();
  }, [activeTab, fetchStores]);

  const handleUserSort = (f) => {
    if (userSortBy === f) setUserOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setUserSortBy(f);
      setUserOrder("asc");
    }
    setUsersPage(1);
  };
  const handleStoreSort = (f) => {
    if (storeSortBy === f) setStoreOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setStoreSortBy(f);
      setStoreOrder("asc");
    }
    setStoresPage(1);
  };

  const roleBadge = (role) => {
    const configs = {
      ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
      USER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      STORE_OWNER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return (
      <span
        className={`px-2.5 py-1 text-[10px] rounded-lg border font-black uppercase tracking-wider ${configs[role] || ""}`}
      >
        {role}
      </span>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "stores", label: "Manage Stores", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#050505] text-slate-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <h1 className="text-4xl font-black tracking-tighter uppercase">
                Command Center
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-500 text-sm font-medium tracking-wide">
              Platform governance and resource management
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white dark:bg-[#111111] p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === t.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300"
                }`}
              >
                <t.icon size={16} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Overview */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {!stats ? (
                <div className="col-span-3 py-20">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <StatCard
                    label="Platform Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-600"
                  />
                  <StatCard
                    label="Registered Stores"
                    value={stats.totalStores}
                    icon={Store}
                    color="bg-emerald-600"
                  />
                  <StatCard
                    label="Engagement / Ratings"
                    value={stats.totalRatings}
                    icon={Star}
                    color="bg-amber-500"
                  />
                </>
              )}
            </motion.div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Filter Bar */}
              <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-[#111111] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="relative flex-1 group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    placeholder="Search by name..."
                    value={userSearch.name}
                    onChange={(e) => {
                      setUserSearch((s) => ({ ...s, name: e.target.value }));
                      setUsersPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="relative flex-1">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    placeholder="Search email..."
                    value={userSearch.email}
                    onChange={(e) => {
                      setUserSearch((s) => ({ ...s, email: e.target.value }));
                      setUsersPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={userSearch.role}
                    onChange={(e) => {
                      setUserSearch((s) => ({ ...s, role: e.target.value }));
                      setUsersPage(1);
                    }}
                    className="px-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-700 dark:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                    <option value="STORE_OWNER">STORE_OWNER</option>
                  </select>
                  <button
                    onClick={() => setAddUserOpen(true)}
                    className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add User</span>
                  </button>
                </div>
              </div>

              {/* User Table */}
              <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-[#111111] border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="px-6 py-5">
                          <SortBtn
                            field="name"
                            current={userSortBy}
                            order={userOrder}
                            onClick={handleUserSort}
                          >
                            Identity
                          </SortBtn>
                        </th>
                        <th className="px-6 py-5">
                          <SortBtn
                            field="email"
                            current={userSortBy}
                            order={userOrder}
                            onClick={handleUserSort}
                          >
                            Connectivity
                          </SortBtn>
                        </th>
                        <th className="px-6 py-5">
                          <SortBtn
                            field="role"
                            current={userSortBy}
                            order={userOrder}
                            onClick={handleUserSort}
                          >
                            Authority
                          </SortBtn>
                        </th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          Localization
                        </th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          Linked Entity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {usersLoading ? (
                        <tr>
                          <td colSpan={5} className="py-20">
                            <LoadingSpinner />
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-20 text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest text-xs"
                          >
                            No Records Found
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-6 py-5 font-bold text-slate-800 dark:text-gray-200">
                              {u.name}
                            </td>
                            <td className="px-6 py-5 text-slate-500 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                              {u.email}
                            </td>
                            <td className="px-6 py-5">{roleBadge(u.role)}</td>
                            <td className="px-6 py-5 text-slate-400 dark:text-gray-500 text-xs italic">
                              {u.address || "—"}
                            </td>
                            <td className="px-6 py-5">
                              {u.store_name ? (
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tighter">
                                    {u.store_name}
                                  </span>
                                  <span className="text-[10px] text-amber-500 font-bold">
                                    {u.store_avg_rating
                                      ? `★ ${parseFloat(u.store_avg_rating).toFixed(1)}`
                                      : "No reviews"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-gray-700">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                page={usersPage}
                totalPages={usersTotalPages}
                onPageChange={setUsersPage}
              />
            </motion.div>
          )}

          {/* Stores */}
          {activeTab === "stores" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-[#111111] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="relative flex-1 group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 group-focus-within:text-emerald-500"
                    size={18}
                  />
                  <input
                    placeholder="Search store name..."
                    value={storeSearch.name}
                    onChange={(e) => {
                      setStoreSearch((s) => ({ ...s, name: e.target.value }));
                      setStoresPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 outline-none transition-all"
                  />
                </div>
                <div className="relative flex-1 group">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 group-focus-within:text-emerald-500"
                    size={18}
                  />
                  <input
                    placeholder="Filter by location..."
                    value={storeSearch.address}
                    onChange={(e) => {
                      setStoreSearch((s) => ({
                        ...s,
                        address: e.target.value,
                      }));
                      setStoresPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => setAddStoreOpen(true)}
                  className="flex items-center gap-2 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Store</span>
                </button>
              </div>

              <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-[#111111] border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          Visual
                        </th>
                        <th className="px-6 py-5">
                          <SortBtn
                            field="name"
                            current={storeSortBy}
                            order={storeOrder}
                            onClick={handleStoreSort}
                          >
                            Entity
                          </SortBtn>
                        </th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          Principal
                        </th>
                        <th className="px-6 py-5">
                          <SortBtn
                            field="avg_rating"
                            current={storeSortBy}
                            order={storeOrder}
                            onClick={handleStoreSort}
                          >
                            Public Rating
                          </SortBtn>
                        </th>
                        <th className="px-6 py-5 text-center text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {storesLoading ? (
                        <tr>
                          <td colSpan={7} className="py-20">
                            <LoadingSpinner />
                          </td>
                        </tr>
                      ) : stores.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-20 text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest text-xs"
                          >
                            Zero Stores Initialized
                          </td>
                        </tr>
                      ) : (
                        stores.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-6 py-4">
                              {s.image_url ? (
                                <img
                                  src={s.image_url}
                                  alt={s.name}
                                  className="w-14 h-10 object-cover rounded-lg border border-slate-200 dark:border-white/10"
                                />
                              ) : (
                                <div className="w-14 h-10 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-600">
                                  <Store size={18} />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-gray-200">
                              {s.name}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-500">
                              {s.email || "—"}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-tighter">
                              {s.owner_name || "—"}
                            </td>
                            <td className="px-6 py-4">
                              {s.avg_rating ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 dark:text-white">
                                    {parseFloat(s.avg_rating).toFixed(1)}
                                  </span>
                                  <StarDisplay
                                    rating={parseFloat(s.avg_rating)}
                                  />
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-gray-700 text-xs italic font-medium">
                                  PENDING
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => setImageModalStore(s)}
                                className="text-[10px] px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 font-black uppercase tracking-widest transition-all"
                              >
                                {s.image_url ? "Manage Media" : "Attach Image"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                page={storesPage}
                totalPages={storesTotalPages}
                onPageChange={setStoresPage}
              />
            </motion.div>
          )}
        </AnimatePresence>

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

      <AddUserModal
        isOpen={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onSuccess={fetchUsers}
      />
      <AddStoreModal
        isOpen={addStoreOpen}
        onClose={() => setAddStoreOpen(false)}
        onSuccess={fetchStores}
      />
      <StoreImageModal
        store={imageModalStore}
        isOpen={!!imageModalStore}
        onClose={() => setImageModalStore(null)}
        onSuccess={fetchStores}
      />
    </div>
  );
};

export default AdminDashboard;
