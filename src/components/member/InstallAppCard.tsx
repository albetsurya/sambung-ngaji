import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, Check, Copy } from "../common/FontAwesomeIcons";
import { Card, Button } from "../common";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { useToast } from "../../contexts/ToastContext";
import { InstallConfirmModal } from "./InstallConfirmModal";

/**
 * Kartu "Install Aplikasi".
 * - Tombol install (via beforeinstallprompt) untuk perangkat yang mendukung.
 * - QR code ke URL aplikasi: scan → buka di browser → ketuk "Install".
 * - Tombol salin/share link.
 */
export function InstallAppCard() {
  const { showToast } = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const appUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      showToast("Link aplikasi disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin link", "error");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sambung Ngaji",
          text: "Instal aplikasi Sambung Ngaji lewat link berikut:",
          url: appUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-ios-footnote font-medium text-surface-muted px-0.5">
        Install Aplikasi
      </p>
      <Card className="p-4">
        {installed ? (
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-ios-subhead font-semibold text-surface-text">
                Aplikasi sudah terinstal
              </p>
              <p className="text-ios-caption text-surface-muted">
                Berjalan dalam mode aplikasi.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Download size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ios-subhead font-semibold text-surface-text">
                  Install Sambung Ngaji
                </p>
                <p className="text-ios-caption text-surface-muted">
                  Akses dari layar utama, seperti aplikasi biasa.
                </p>
              </div>
            </div>

            {canInstall && (
              <Button
                variant="primary"
                fullWidth
                className="mb-3"
                onClick={() => setConfirmOpen(true)}
              >
                <Download size={16} /> Install
              </Button>
            )}

            <div className="flex items-center gap-3">
              <div className="shrink-0 bg-white p-1.5 rounded-xl">
                <QRCodeCanvas
                  value={appUrl}
                  size={84}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="M"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-footnote text-surface-muted leading-relaxed">
                  Scan QR dari HP lain, lalu ketuk{" "}
                  <span className="font-semibold text-surface-text">Install</span>{" "}
                  di browser.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Tersalin" : "Salin"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleShare}>
                    <Share2 size={13} /> Bagikan
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <InstallConfirmModal
        open={confirmOpen}
        loading={installing}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setInstalling(true);
          try {
            const ok = await promptInstall();
            if (ok) showToast("Aplikasi berhasil diinstall");
            else showToast("Install dibatalkan", "warning");
          } catch {
            showToast("Gagal install", "error");
          } finally {
            setInstalling(false);
            setConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}