import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { StarDisplay } from '../components/StarRating';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/ratings/store');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load store data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">No store found</h2>
        <p className="text-slate-500">{error}</p>
        <p className="text-sm text-slate-400 mt-2">Contact an admin to assign a store to your account.</p>
      </div>
    );
  }

  const { store, ratings, averageRating, totalRatings } = data;

  // rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Store Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user.name}</p>
      </div>

      {/* store overview card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1">
            {store.image_url && (
            <img src={store.image_url} alt={store.name} className="w-full h-40 object-cover rounded-xl mb-4" />
          )}
          <h2 className="text-xl font-bold text-slate-900">{store.name}</h2>
            {store.address && <p className="text-slate-500 mt-1 text-sm">{store.address}</p>}
          </div>

          <div className="text-center">
            {averageRating ? (
              <>
                <div className="text-5xl font-bold text-slate-900">{parseFloat(averageRating).toFixed(1)}</div>
                <StarDisplay rating={parseFloat(averageRating)} size="lg" />
                <div className="text-sm text-slate-400 mt-1">{totalRatings} review{totalRatings !== 1 ? 's' : ''}</div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">No ratings yet</div>
            )}
          </div>
        </div>

        {/* rating distribution bar */}
        {totalRatings > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Rating Breakdown</h3>
            <div className="flex flex-col gap-2">
              {dist.map(({ star, count }) => {
                const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 w-6 text-right">{star}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs w-12">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ratings list */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Customer Reviews ({totalRatings})
        </h2>

        {ratings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p>No reviews yet. Ratings will appear here once customers rate your store.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ratings.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4 fade-in">
                <div>
                  <div className="font-medium text-slate-900">{r.user_name}</div>
                  <div className="text-sm text-slate-400">{r.user_email}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xl font-bold text-slate-900">{r.rating}</div>
                  <StarDisplay rating={r.rating} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
