import type { Member } from "../types";
import { CATEGORY_LABEL } from "./format";

/**
 * Convert array of objects to CSV string.
 * Handle quote escaping & comma.
 */
function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  var str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function exportMembersToCsv(members: Member[]) {
  var headers = [
    "Nama Lengkap",
    "Nama Panggilan",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Usia",
    "Kategori",
    "Kelompok",
    "Desa",
    "Daerah",
    "Alamat",
    "No WhatsApp",
    "Pekerjaan",
    "Hobi",
    "Status Pembinaan",
  ];

  var rows = members.map(function (m) {
    return [
      m.nama_lengkap || "",
      m.nama_panggilan || "",
      m.jenis_kelamin === "L"
        ? "Laki-laki"
        : m.jenis_kelamin === "P"
          ? "Perempuan"
          : "",
      m.tempat_lahir || "",
      m.tanggal_lahir || "",
      m.usia || "",
      m.kategori ? CATEGORY_LABEL[m.kategori] : "",
      m.kelompok || "",
      m.desa || "",
      m.daerah || "",
      m.alamat_rumah || "",
      m.no_wa || "",
      m.pekerjaan || "",
      m.hobi || "",
      m.status_pembinaan || "",
    ];
  });

  var csv =
    headers.map(toCsvValue).join(",") +
    "\n" +
    rows
      .map(function (row) {
        return row.map(toCsvValue).join(",");
      })
      .join("\n");

  downloadCsv(csv, "daftar-jamaah");
}

function downloadCsv(csv: string, filename: string) {
  var blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  var date = new Date().toISOString().slice(0, 10);
  link.download = filename + "-" + date + ".csv";
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
