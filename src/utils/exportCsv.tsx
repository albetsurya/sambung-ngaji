import type { Member } from "../types";
import { CATEGORY_LABEL } from "./format";

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
      m.full_name || "",
      m.nickname || "",
      m.gender === "L"
        ? "Laki-laki"
        : m.gender === "P"
          ? "Perempuan"
          : "",
      m.birth_place || "",
      m.birth_date || "",
      m.usia || "",
      m.kategori ? CATEGORY_LABEL[m.kategori] : "",
      m.group_label || "",
      m.village || "",
      m.region || "",
      m.home_address || "",
      m.whatsapp_number || "",
      m.occupation || "",
      m.hobby || "",
      m.mentoring_status || "",
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
