import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { StarDisplay } from '../components/StarRating';
import { validateUserForm } from '../hooks/useValidation';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
    <div className={`text-3xl p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value ?? '—'}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
);

const SortBtn = ({ field, current, order, onClick, children }) => (
  <button
    onClick={() => onClick(field)}
    className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
      current === field ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {children}
    {current === field && <span>{order === 'asc' ? '↑' : '↓'}</span>}
  </button>
);

// ─── Image Upload Widget ───────────────────────────────────────────────────────
const ImagePicker = ({ onChange, preview, setPreview }) => {
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Store Image (optional)</label>
      <div
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed border-slate-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors text-center"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
        ) : (
          <div className="text-slate-400 text-sm py-4">
            <div className="text-2xl mb-1">📷</div>
            Click to upload image (JPEG, PNG, WebP — max 5MB)
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); onChange(null); fileRef.current.value = ''; }}
          className="text-xs text-red-500 hover:underline self-start"
        >
          Remove image
        </button>
      )}
    </div>
  );
};

// ─── Add User Modal ────────────────────────────────────────────────────────────
const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(errs => ({ ...errs, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErr('');
    const errs = validateUserForm(form);
    if (!form.password) errs.password = 'Password is required.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/admin/users', form);
      onSuccess();
      onClose();
      setForm({ name: '', email: '', password: '', address: '', role: 'USER' });
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required hint="20–60 characters" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required hint="8–16 chars, uppercase + special char" />
        <FormField label="Address" name="address" type="textarea" value={form.address} onChange={handleChange} error={errors.address} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Role <span className="text-red-400">*</span></label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </select>
        </div>
        {serverErr && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverErr}</div>}
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1">
          {loading ? 'Creating…' : 'Create User'}
        </button>
      </form>
    </Modal>
  );
};

// ─── Add Store Modal ───────────────────────────────────────────────────────────
const AddStoreModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [owners, setOwners] = useState([]);
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/admin/users', { params: { role: 'STORE_OWNER', limit: 100 } })
        .then(res => setOwners(res.data.users))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setServerErr('Store name is required.'); return; }
    setLoading(true);
    setServerErr('');
    try {
      // send as multipart/form-data so the image file can travel with the request
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.email) formData.append('email', form.email);
      if (form.address) formData.append('address', form.address);
      if (form.owner_id) formData.append('owner_id', form.owner_id);
      if (imageFile) formData.append('image', imageFile);

      await api.post('/admin/stores', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
      onClose();
      setForm({ name: '', email: '', address: '', owner_id: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Store">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <FormField label="Store Name" name="name" value={form.name} onChange={handleChange} required />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <FormField label="Address" name="address" type="textarea" value={form.address} onChange={handleChange} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Store Owner (optional)</label>
          <select name="owner_id" value={form.owner_id} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— No owner —</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </select>
        </div>
        <ImagePicker onChange={setImageFile} preview={imagePreview} setPreview={setImagePreview} />
        {serverErr && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverErr}</div>}
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1">
          {loading ? 'Creating…' : 'Create Store'}
        </button>
      </form>
    </Modal>
  );
};

// ─── Store Image Manager Modal ─────────────────────────────────────────────────
const StoreImageModal = ({ store, isOpen, onClose, onSuccess }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(store?.image_url || null);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  useEffect(() => {
    if (store) setImagePreview(store.image_url || null);
    setImageFile(null);
    setServerErr('');
  }, [store]);

  const handleUpload = async () => {
    if (!imageFile) return;
    setLoading(true);
    setServerErr('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      await api.put(`/admin/stores/${store.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove the store image?')) return;
    setLoading(true);
    try {
      await api.delete(`/admin/stores/${store.id}/image`);
      onSuccess();
      onClose();
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Image — ${store.name}`} size="sm">
      <div className="flex flex-col gap-4">
        <ImagePicker onChange={setImageFile} preview={imagePreview} setPreview={setImagePreview} />
        {serverErr && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverErr}</div>}
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={loading || !imageFile}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Uploading…' : 'Upload Image'}
          </button>
          {store.image_url && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState({ name: '', email: '', role: '' });
  const [userSortBy, setUserSortBy] = useState('created_at');
  const [userOrder, setUserOrder] = useState('desc');
  const [addUserOpen, setAddUserOpen] = useState(false);

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesPage, setStoresPage] = useState(1);
  const [storesTotalPages, setStoresTotalPages] = useState(1);
  const [storeSearch, setStoreSearch] = useState({ name: '', address: '' });
  const [storeSortBy, setStoreSortBy] = useState('created_at');
  const [storeOrder, setStoreOrder] = useState('desc');
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [imageModalStore, setImageModalStore] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { ...userSearch, page: usersPage, limit: 10, sortBy: userSortBy, order: userOrder }
      });
      setUsers(res.data.users);
      setUsersTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
    finally { setUsersLoading(false); }
  }, [userSearch, usersPage, userSortBy, userOrder]);

  const fetchStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/admin/stores', {
        params: { ...storeSearch, page: storesPage, limit: 10, sortBy: storeSortBy, order: storeOrder }
      });
      setStores(res.data.stores);
      setStoresTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
    finally { setStoresLoading(false); }
  }, [storeSearch, storesPage, storeSortBy, storeOrder]);

  useEffect(() => { if (activeTab === 'users')  fetchUsers();  }, [activeTab, fetchUsers]);
  useEffect(() => { if (activeTab === 'stores') fetchStores(); }, [activeTab, fetchStores]);

  const handleUserSort  = (f) => { if (userSortBy  === f) setUserOrder(o  => o === 'asc' ? 'desc' : 'asc'); else { setUserSortBy(f);  setUserOrder('asc'); }  setUsersPage(1); };
  const handleStoreSort = (f) => { if (storeSortBy === f) setStoreOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setStoreSortBy(f); setStoreOrder('asc'); } setStoresPage(1); };

  const roleBadge = (role) => {
    const colors = { ADMIN: 'bg-purple-100 text-purple-700', USER: 'bg-blue-100 text-blue-700', STORE_OWNER: 'bg-green-100 text-green-700' };
    return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colors[role] || ''}`}>{role}</span>;
  };

  const tabs = [{ id: 'overview', label: '📊 Overview' }, { id: 'users', label: '👥 Users' }, { id: 'stores', label: '🏪 Stores' }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage users, stores, and platform statistics</p>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="fade-in">
          {!stats ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Users"   value={stats.totalUsers}   icon="👥" color="bg-blue-50" />
              <StatCard label="Total Stores"  value={stats.totalStores}  icon="🏪" color="bg-green-50" />
              <StatCard label="Total Ratings" value={stats.totalRatings} icon="⭐" color="bg-amber-50" />
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input placeholder="Filter by name…" value={userSearch.name}
              onChange={e => { setUserSearch(s => ({ ...s, name: e.target.value })); setUsersPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
            <input placeholder="Filter by email…" value={userSearch.email}
              onChange={e => { setUserSearch(s => ({ ...s, email: e.target.value })); setUsersPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
            <select value={userSearch.role} onChange={e => { setUserSearch(s => ({ ...s, role: e.target.value })); setUsersPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
            </select>
            <button onClick={() => setAddUserOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
              + Add User
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-500"><SortBtn field="name" current={userSortBy} order={userOrder} onClick={handleUserSort}>Name</SortBtn></th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500"><SortBtn field="email" current={userSortBy} order={userOrder} onClick={handleUserSort}>Email</SortBtn></th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500"><SortBtn field="role" current={userSortBy} order={userOrder} onClick={handleUserSort}>Role</SortBtn></th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Address</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Store / Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading ? (
                    <tr><td colSpan={5} className="py-8"><LoadingSpinner /></td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{u.address || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.store_name ? (
                          <div>
                            <div className="text-xs text-slate-700 font-medium">{u.store_name}</div>
                            <div className="text-xs text-slate-400">{u.store_avg_rating ? `★ ${parseFloat(u.store_avg_rating).toFixed(1)}` : 'No ratings'}</div>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input placeholder="Filter by name…" value={storeSearch.name}
              onChange={e => { setStoreSearch(s => ({ ...s, name: e.target.value })); setStoresPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
            <input placeholder="Filter by address…" value={storeSearch.address}
              onChange={e => { setStoreSearch(s => ({ ...s, address: e.target.value })); setStoresPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
            <button onClick={() => setAddStoreOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
              + Add Store
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Image</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500"><SortBtn field="name" current={storeSortBy} order={storeOrder} onClick={handleStoreSort}>Name</SortBtn></th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Address</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Owner</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500"><SortBtn field="avg_rating" current={storeSortBy} order={storeOrder} onClick={handleStoreSort}>Avg Rating</SortBtn></th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storesLoading ? (
                    <tr><td colSpan={7} className="py-8"><LoadingSpinner /></td></tr>
                  ) : stores.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">No stores found.</td></tr>
                  ) : stores.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.name} className="w-12 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">🏪</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.email || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{s.address || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{s.owner_name || '—'}</td>
                      <td className="px-4 py-3">
                        {s.avg_rating ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-slate-900">{parseFloat(s.avg_rating).toFixed(1)}</span>
                            <StarDisplay rating={parseFloat(s.avg_rating)} />
                          </div>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setImageModalStore(s)}
                          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                          {s.image_url ? '🖼 Image' : '+ Image'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={storesPage} totalPages={storesTotalPages} onPageChange={setStoresPage} />
        </div>
      )}

      <AddUserModal  isOpen={addUserOpen}  onClose={() => setAddUserOpen(false)}  onSuccess={fetchUsers} />
      <AddStoreModal isOpen={addStoreOpen} onClose={() => setAddStoreOpen(false)} onSuccess={fetchStores} />
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
