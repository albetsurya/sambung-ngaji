import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export function ModalPanel({ title, children, onClose, warm = false }: { title: string; children: ReactNode; onClose?: () => void; warm?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = ref.current;
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const buttons = panel?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!buttons?.length) return;
      const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); previous?.focus(); };
  }, [onClose]);
  return createPortal(
    <div onClick={(event) => { if (event.target === event.currentTarget) onClose?.(); }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-5 py-6 backdrop-blur-sm">
      <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={`ceria-modal max-h-[calc(100dvh-3rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-3xl border p-6 text-center shadow-2xl ${warm ? "border-[#E2D4C0] bg-[#FFF8EE] text-[#5A3A2A]" : "border-white/20 bg-slate-900 text-white"}`}>
        <h2 className="font-display text-2xl font-black">{title}</h2>
        {children}
      </motion.div>
    </div>, document.body,
  );
}
