import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";

export const FinanceGuard: React.FC = () => {
  const { canAccessFinance, role } = usePermission();

  if (!canAccessFinance) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Akses Terkunci
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          Modul Keuangan (SabilKas) khusus untuk <strong>Super Admin</strong> dan <strong>Tim KU</strong>. Peran Anda ({role || "Tamu"}) tidak memiliki hak akses.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  return <Outlet />;
};
