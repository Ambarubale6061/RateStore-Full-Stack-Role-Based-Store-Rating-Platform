import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import StarRating, { StarDisplay } from '../components/StarRating';
import Modal from '../components/Modal';

const StoreImage = ({ url, name }) => {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return (
      <div className="w-full h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-t-xl">
        <span className="text-4xl">🏪</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      onError={() => setBroken(true)}
      className="w-full h-36 object-cover rounded-t-xl"
    />
  );
};

const StoreCard = ({ store, onRate }) => {
  const avg = store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow fade-in overflow-hidden">
      <StoreImage url={store.image_url} name={store.name} />
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base truncate">{store.name}</h3>
            {store.address && (
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{store.address}</p>
            )}
            {store.email && <p className="text-xs text-slate-400 mt-1">{store.email}</p>}
          </div>
          <div className="text-right shrink-0">
            {avg ? (
              <div>
                <div className="text-2xl font-bold text-slate-900">{avg}</div>
                <StarDisplay rating={parseFloat(avg)} />
                <div className="text-xs text-slate-400 mt-0.5">
                  {store.total_ratings} rating{store.total_ratings !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No ratings yet</span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm">
            {store.my_rating ? (
              <span className="text-slate-600">
                Your rating: <span className="font-semibold text-amber-500">{store.my_rating}★</span>
              </span>
            ) : (
              <span className="text-slate-400">Not rated yet</span>
            )}
          </div>
          {onRate && (
            <button
              onClick={() => onRate(store)}
              className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {store.my_rating ? 'Edit Rating' : 'Rate Store'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const RatingModal = ({ store, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (store) setRating(store.my_rating || 0);
  }, [store]);

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a rating.'); return; }
    setLoading(true);
    setError('');
    try {
      if (store.my_rating) {
        await api.put('/ratings', { store_id: store.id, rating });
      } else {
        await api.post('/ratings', { store_id: store.id, rating });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={store.my_rating ? 'Update Rating' : 'Rate Store'} size="sm">
      <div className="flex flex-col items-center gap-4">
        {store.image_url && (
          <img src={store.image_url} alt={store.name} className="w-full h-28 object-cover rounded-lg" />
        )}
        <p className="text-slate-700 font-medium text-center">{store.name}</p>
        <StarRating value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-sm text-slate-500">
            {['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'][rating]}
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || !rating}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting…' : store.my_rating ? 'Update Rating' : 'Submit Rating'}
        </button>
      </div>
    </Modal>
  );
};

const StoreListPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
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
      const res = await api.get('/stores', { params });
      setStores(res.data.stores);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order, search]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setOrder('asc'); }
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Stores</h1>
        <p className="text-slate-500 text-sm mt-1">{total} store{total !== 1 ? 's' : ''} available</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or address…"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex gap-2">
          {[['name', 'Name'], ['avg_rating', 'Rating']].map(([field, label]) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors flex items-center gap-1 ${
                sortBy === field ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label} {sortBy === field && (order === 'asc' ? '↑' : '↓')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : stores.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">🏪</div>
          <p className="font-medium">No stores found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              onRate={user?.role === 'USER' ? (s) => { setSelectedStore(s); setRatingModalOpen(true); } : null}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
