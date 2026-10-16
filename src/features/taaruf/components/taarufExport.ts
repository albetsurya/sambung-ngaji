import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";


async function capture(
  node: HTMLElement,
  options: { ignoreTransform?: boolean } = {},
): Promise<HTMLCanvasElement> {
  const previousTransform = node.style.transform;
  const previousTransformOrigin = node.style.transformOrigin;
  if (options.ignoreTransform) {
    node.style.transform = "none";
    node.style.transformOrigin = "top left";
    void node.offsetHeight;
  }
  try {
    return await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
  } finally {
    if (options.ignoreTransform) {
      node.style.transform = previousTransform;
      node.style.transformOrigin = previousTransformOrigin;
    }
  }
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
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "cv-taaruf";
}

interface ExportFilenameOptions {
  includeDate?: boolean;
}

export function taarufFilename(
  name: string,
  ext: "png" | "pdf",
  prefix = "CV-Taaruf",
  options: ExportFilenameOptions = {},
): string {
  const base = prefix ? `${prefix}-${safeFilename(name)}` : safeFilename(name);
  const suffix = options.includeDate === false
    ? ""
    : `-${new Date().toISOString().slice(0, 10)}`;
  return `${base}${suffix}.${ext}`;
}

export async function exportTaarufPng(
  node: HTMLElement,
  name: string,
  prefix = "CV-Taaruf",
  options: ExportFilenameOptions = {},
): Promise<void> {
  const canvas = await capture(node);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/png"),
  );
  if (!blob) throw new Error("Gagal membuat gambar");
  const url = URL.createObjectURL(blob);
  try {
    download(url, taarufFilename(name, "png", prefix, options));
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function exportTaarufPdf(
  node: HTMLElement,
  name: string,
  prefix = "CV-Taaruf",
  options: {
    margin?: number;
    ignoreTransform?: boolean;
    orientation?: "portrait" | "landscape";
    includeDate?: boolean;
  } = {},
): Promise<void> {
  const canvas = await capture(node, options);
  const imgData = canvas.toDataURL("image/png");

  const landscape = options.orientation
    ? options.orientation === "landscape"
    : canvas.width > canvas.height;
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: landscape ? "landscape" : "portrait",
  });
  const pageW = landscape ? 297 : 210;
  const pageH = landscape ? 210 : 297;
  const margin = Math.max(0, options.margin ?? 10);
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

  pdf.save(taarufFilename(name, "pdf", prefix, options));
}
