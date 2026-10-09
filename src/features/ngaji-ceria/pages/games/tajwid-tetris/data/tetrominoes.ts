export interface TetrominoTemplate {
  id: string;
  label: string;
  rule: string;
  color: string;
  shape: number[][];
}

export const TETROMINOES: TetrominoTemplate[] = [
  { id: "mad", label: "مَدّ", rule: "Mad memanjangkan bacaan sesuai tanda dan sebabnya.", color: "#22d3ee", shape: [[1, 1, 1, 1]] },
  { id: "izhar", label: "إظْهَار", rule: "Izhar dibaca jelas tanpa dengung tambahan.", color: "#a78bfa", shape: [[1, 1], [1, 1]] },
  { id: "ikhfa", label: "إخْفَاء", rule: "Ikhfa dibaca samar dengan dengung.", color: "#34d399", shape: [[0, 1, 0], [1, 1, 1]] },
  { id: "idgham", label: "إدْغَام", rule: "Idgham meleburkan satu huruf ke huruf berikutnya.", color: "#f472b6", shape: [[1, 0], [1, 0], [1, 1]] },
  { id: "iqlab", label: "إقْلَاب", rule: "Iqlab mengubah nun sukun atau tanwin menjadi mim.", color: "#fbbf24", shape: [[0, 1], [0, 1], [1, 1]] },
  { id: "qalqalah", label: "قَلْقَلَة", rule: "Qalqalah memberi pantulan pada huruf tertentu ketika sukun.", color: "#fb7185", shape: [[1, 1, 0], [0, 1, 1]] },
  { id: "ghunnah", label: "غُنَّة", rule: "Ghunnah adalah suara dengung yang keluar dari rongga hidung.", color: "#fb923c", shape: [[0, 1, 1], [1, 1, 0]] },
];
