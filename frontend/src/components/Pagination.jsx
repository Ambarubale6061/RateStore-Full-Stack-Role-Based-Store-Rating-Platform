import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const range = 2;
  for (
    let i = Math.max(1, page - range);
    i <= Math.min(totalPages, page + range);
    i++
  ) {
    pages.push(i);
  }

  const btnBase =
    "px-3 py-1.5 rounded-md text-sm border transition-colors border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5";

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        ←
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btnBase}>
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-slate-400 dark:text-gray-600 px-1">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
            p === page
              ? "bg-blue-600 text-white border-blue-600"
              : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5"
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-slate-400 dark:text-gray-600 px-1">…</span>
          )}
          <button onClick={() => onPageChange(totalPages)} className={btnBase}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
