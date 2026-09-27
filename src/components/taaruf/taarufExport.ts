import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";


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

export function taarufFilename(
  nama: string,
  ext: "png" | "pdf",
  prefix = "CV-Taaruf",
): string {
  const date = new Date().toISOString().slice(0, 10);
  const base = prefix ? `${prefix}-${safeFilename(nama)}` : safeFilename(nama);
  return `${base}-${date}.${ext}`;
}

export async function exportTaarufPng(
  node: HTMLElement,
  nama: string,
  prefix = "CV-Taaruf",
): Promise<void> {
  const canvas = await capture(node);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/png"),
  );
  if (!blob) throw new Error("Gagal membuat gambar");
  const url = URL.createObjectURL(blob);
  try {
    download(url, taarufFilename(nama, "png", prefix));
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function exportTaarufPdf(
  node: HTMLElement,
  nama: string,
  prefix = "CV-Taaruf",
): Promise<void> {
  const canvas = await capture(node);
  const imgData = canvas.toDataURL("image/png");

  const landscape = canvas.width > canvas.height;
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: landscape ? "landscape" : "portrait",
  });
  const pageW = landscape ? 297 : 210;
  const pageH = landscape ? 210 : 297;
  const margin = 10;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  const imgH = (contentW * canvas.height) / canvas.width;

  if (imgH <= contentH) {
    pdf.addImage(imgData, "PNG", margin, margin, contentW, imgH);
  } else {
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

  pdf.save(taarufFilename(nama, "pdf", prefix));
}
