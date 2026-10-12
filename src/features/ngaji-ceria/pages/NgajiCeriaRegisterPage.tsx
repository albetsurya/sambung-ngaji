import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, User, Lock, Sparkles } from "../../../components/ui/FontAwesomeIcons";
import { Button } from "../../../components/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { ApiError } from "../../../services/api";

export default function NgajiCeriaRegisterPage() {
  const navigate = useNavigate();
  const { registerCeria } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username.trim() !== username || !/^[a-z0-9][a-z0-9_]{2,31}$/.test(username)) {
      setError("Username harus 3–32 karakter: huruf kecil, angka, atau underscore.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setSubmitting(true);
    try {
      await registerCeria(name, username, password, confirmPassword);
      sessionStorage.setItem("trigger_ngaji_ceria_splash", "true");
      navigate("/member/ngaji-ceria");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat akun. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8EE] flex flex-col justify-center px-6 py-12">
      <div className="max-w-sm w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#F58A3A] text-white shadow-md">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#5A3A2A]">Daftar Akun Santri</h1>
          <p className="text-xs text-[#8C7A68]">
            Mulai petualangan belajar Tilawati dan simpan skor permainanmu!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-[#E2D4C0] shadow-sm space-y-4">
          <div>
            <label htmlFor="ceria-name" className="block text-xs font-bold text-[#5A3A2A] mb-1">Nama Panggilan</label>
            <div className="relative">
              <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8A690]" />
              <input
                type="text"
                id="ceria-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Rayhan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2D4C0] text-sm focus:outline-none focus:border-[#F58A3A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ceria-username" className="block text-xs font-bold text-[#5A3A2A] mb-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8A690]" />
              <input
                type="text"
                id="ceria-username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                minLength={3}
                maxLength={32}
                placeholder="Username akun"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2D4C0] text-sm focus:outline-none focus:border-[#F58A3A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ceria-password" className="block text-xs font-bold text-[#5A3A2A] mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8A690]" />
              <input
                type="password"
                id="ceria-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={128}
                placeholder="Buat password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2D4C0] text-sm focus:outline-none focus:border-[#F58A3A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ceria-confirm-password" className="block text-xs font-bold text-[#5A3A2A] mb-1">Konfirmasi Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8A690]" />
              <input
                type="password"
                id="ceria-confirm-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2D4C0] text-sm focus:outline-none focus:border-[#F58A3A]"
              />
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-relaxed text-red-700">{error}</p>}

          <Button
            type="submit"
            fullWidth
            loading={submitting}
            className="!bg-[#F58A3A] hover:!bg-[#E2561A] !text-white font-bold rounded-xl mt-2"
          >
            Mulai Belajar Sekarang <ArrowRight size={14} className="ml-1" />
          </Button>
        </form>

        <div className="text-center">
          <Link to="/login?intent=ceria" className="text-xs text-[#8C7A68] hover:underline">
            Sudah punya akun? Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
