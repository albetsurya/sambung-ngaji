import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Check,
  Download,
  Share2,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Card, Button } from "../components/common";
import { useToast } from "../contexts/ToastContext";
import { useState } from "react";

export default function QrCodePage() {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const registrationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/daftar`
      : "/daftar";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      showToast("Link disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin link", "error");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pendaftaran Jamaah Pengajian",
          text: "Daftar sebagai jamaah pengajian melalui link berikut:",
          url: registrationUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  }

  function handleDownload() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) {
      showToast("QR Code belum siap", "error");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "qr-pendaftaran-jamaah.png";
    link.href = url;
    link.click();
    showToast("QR Code diunduh");
  }

  return (
    <AppLayout hideNav>
      <Header
        title="QR Code Pendaftaran"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <p className="text-ios-body text-surface-text leading-relaxed">
            Bagikan QR Code ini ke calon jamaah. Mereka bisa memindai untuk
            membuka form pendaftaran langsung dari HP.
          </p>
        </div>

        <Card>
          <div className="flex flex-col items-center py-4">
            <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-sm">
              <QRCodeCanvas
                value={registrationUrl}
                size={220}
                level="H"
                includeMargin={false}
                fgColor="#1E3A8A"
                bgColor="#FFFFFF"
              />
            </div>
            <p className="text-ios-footnote text-surface-muted mt-4 text-center">
              Pindai untuk mendaftar
            </p>
          </div>
        </Card>

        <Card>
          <p className="text-ios-footnote font-medium text-surface-muted mb-2">
            Link Pendaftaran
          </p>
          <div className="rounded-xl bg-surface-card2 px-3 py-2.5 mb-3">
            <code className="text-ios-caption text-accent font-mono break-all">
              {registrationUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleCopy}
              leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? "Tersalin" : "Salin Link"}
            </Button>
            <Button
              fullWidth
              onClick={handleShare}
              leftIcon={<Share2 size={16} />}
            >
              Bagikan
            </Button>
          </div>
        </Card>

        <Button
          variant="secondary"
          fullWidth
          onClick={handleDownload}
          leftIcon={<Download size={16} />}
        >
          Unduh QR Code
        </Button>

        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <p className="text-ios-footnote font-medium text-surface-text mb-2">
            Tips Penggunaan
          </p>
          <ul className="space-y-1.5">
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">•</span>
              <span className="text-ios-footnote text-surface-muted leading-relaxed">
                Cetak QR Code dan tempel di papan pengumuman masjid
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">•</span>
              <span className="text-ios-footnote text-surface-muted leading-relaxed">
                Bagikan link via WhatsApp grup pengajian
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">•</span>
              <span className="text-ios-footnote text-surface-muted leading-relaxed">
                Pendaftar akan otomatis masuk daftar verifikasi admin
              </span>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
