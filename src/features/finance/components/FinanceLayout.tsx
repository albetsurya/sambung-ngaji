import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";

export const FinanceLayout: React.FC = () => {
  const { isSuperAdmin, assignedGroup } = usePermission();

  const navItems = [
    { path: "/finance/ledger", label: "Kas Ledger", icon: "wallet" },
    { path: "/finance/monthly-dues", label: "Shodaqoh & Infaq", icon: "hand-holding-heart" },
    { path: "/finance/zakat", label: "Zakat Fitrah & Mal", icon: "box-heart" },
    { path: "/finance/assistant", label: "AI Financial Assistant", icon: "sparkles" },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 dark:from-slate-800 dark:via-emerald-950 dark:to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                SabilKas Module
              </span>
              <span className="text-xs text-emerald-200/80">
                {isSuperAdmin ? "Akses Global (Super Admin)" : "Tim Keuangan Kelompok"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-emerald-100 border border-white/20">
                {assignedGroup ? `Kelompok: ${assignedGroup}` : "Kelompok: belum dipilih"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Laporan & Manajemen Keuangan
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl">
              Pencatatan kas ledger, shodaqoh bulanan, zakat fitrah & mal terintegrasi dalam ekosistem Sabil.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-4 border-t border-emerald-600/30 no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-white text-emerald-900 shadow-md font-semibold"
                    : "bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/70"
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Dynamic Sub-page */}
      <Outlet />
    </div>
  );
};
