import { Component, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../../../components/NgajiCeriaLayout";

function Fallback() {
  const navigate = useNavigate();
  return <NgajiCeriaLayout title="Mini Games" showBack hideNav onBack={() => navigate("/member/ngaji-ceria/games")}><div className="p-6 text-center"><h1 className="font-display text-xl font-black">Game belum bisa dilanjutkan</h1><p className="my-4 text-sm">Coba buka lagi dari daftar game, ya.</p><button className="rounded-2xl bg-cyan-700 px-5 py-3 font-bold text-white" onClick={() => navigate("/member/ngaji-ceria/games")}>Kembali ke Games</button></div></NgajiCeriaLayout>;
}

export class GameBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}
