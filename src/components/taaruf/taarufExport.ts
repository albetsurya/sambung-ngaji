import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Export CV Taaruf dari node DOM (render off-screen tanpa catatan rahasia).
 * Hasil = apa yang tampil di preview (WYSIWYG).
 */

async function capture(node: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
}

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function safeFilename(name: string): string {
  const clean = name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
  return clean || "cv-taaruf";
}

export function taarufFilename(nama: string, ext: "png" | "pdf"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `CV-Taaruf-${safeFilename(nama)}-${date}.${ext}`;
}

/** PNG siap bagikan (mis. WhatsApp). */
export async function exportTaarufPng(
  node: HTMLElement,
  nama: string,
): Promise<void> {
  const canvas = await capture(node);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/png"),
  );
  if (!blob) throw new Error("Gagal membuat gambar");
  const url = URL.createObjectURL(blob);
  try {
    download(url, taarufFilename(nama, "png"));
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

/** PDF A4 portrait. Multi-halaman bila konten melebihi 1 halaman. */
export async function exportTaarufPdf(
  node: HTMLElement,
  nama: string,
): Promise<void> {
  const canvas = await capture(node);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const margin = 10;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  // Tinggi gambar bila dilebarkan selebar konten (mm).
  const imgH = (contentW * canvas.height) / canvas.width;

  if (imgH <= contentH) {
    pdf.addImage(imgData, "PNG", margin, margin, contentW, imgH);
  } else {
    // Potong per halaman.
    const slicePx = Math.floor((canvas.width * contentH) / contentW);
    let rendered = 0;
    let page = 0;
    while (rendered < canvas.height) {
      const h = Math.min(slicePx, canvas.height - rendered);
      const page_canvas = document.createElement("canvas");
      page_canvas.width = canvas.width;
      page_canvas.height = h;
      const ctx = page_canvas.getContext("2d");
      if (!ctx) throw new Error("Gagal membuat PDF");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, page_canvas.width, page_canvas.height);
      ctx.drawImage(
        canvas,
        0,
        rendered,
        canvas.width,
        h,
        0,
        0,
        canvas.width,
        h,
      );
      if (page > 0) pdf.addPage();
      pdf.addImage(
        page_canvas.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        contentW,
        (contentW * h) / canvas.width,
      );
      rendered += h;
      page++;
    }
  }

  pdf.save(taarufFilename(nama, "pdf"));
}
