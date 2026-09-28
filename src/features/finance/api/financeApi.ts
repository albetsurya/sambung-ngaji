const GAS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwqCvr9HQvij6g1q3r0tlxfCu3Slb8xhTCdIZ80jYNXdJIVTOtHHSwmEauU3CLt-yd2/exec";

export interface Transaction {
  no?: number;
  tanggal: string;
  account?: string;
  keterangan: string;
  jenis?: "Debet" | "Kredit";
  debet?: number;
  kredit?: number;
  saldo?: number;
  jumlah?: number;
}

export interface KasDataResponse {
  success: boolean;
  message?: string;
  kasType?: string;
  transactions?: Transaction[];
  saldoAwal?: number;
  totalDebet?: number;
  totalKredit?: number;
  saldoAkhir?: number;
}

export interface ShodaqohMember {
  id: string;
  nama: string;
  nominalBulanan: number;
  status: string;
}

export interface ShodaqohPayment {
  paymentId: string;
  memberId: string;
  tanggalPembayaran: string;
  total: number;
  susulan_ir: number;
  susulan_bulan: string[];
  uang_sambung: number;
  jimpitan: number;
  siar_siar: number;
  seribuan: number;
  kafan: number;
  ukhro_mt: number;
  keterangan: string;
}

export interface ShodaqohDataResponse {
  success: boolean;
  message?: string;
  selectedMonth?: string;
  members?: ShodaqohMember[];
  payments?: ShodaqohPayment[];
  recap?: Record<string, any>;
}

export interface ZakatItem {
  id: string;
  tipeZakat: "FITRAH" | "MAL";
  namaMuzaki: string;
  jumlahJiwa: number;
  totalBerasKg: number;
  totalUangRp: number;
  status: string;
  tanggal: string;
  muzakiList?: any[];
  mustahikList?: any[];
}

export interface ZakatResponse {
  success: boolean;
  message?: string;
  data?: ZakatItem[] | any;
}

async function requestRest<T>(
  method: "GET" | "POST",
  endpoint: string,
  paramsOrBody: Record<string, any> = {},
  kasType: "main" | "kas_amil" = "main"
): Promise<T> {
  let url = GAS_WEB_APP_URL;
  if (endpoint) {
    url += "/" + endpoint.replace(/^\/+/, "");
  }

  if (method === "GET") {
    const searchParams = new URLSearchParams();
    searchParams.append("kasType", kasType);
    for (const [key, val] of Object.entries(paramsOrBody)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error (${res.status})`);
    return res.json();
  } else {
    const payload = {
      kasType: kasType,
      ...paramsOrBody,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP Error (${res.status})`);
    return res.json();
  }
}

export const financeApi = {
  // === KAS LEDGER ===
  getKasTransactions: (kasType: "main" | "kas_amil" = "main") => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions" : "api/kas/transactions";
    return requestRest<KasDataResponse>("GET", endpoint, {}, kasType);
  },

  addTransaction: (data: Omit<Transaction, "no">, kasType: "main" | "kas_amil" = "main") => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/add" : "api/kas/transactions/add";
    return requestRest<KasDataResponse>("POST", endpoint, data, kasType);
  },

  editTransaction: (data: Transaction, kasType: "main" | "kas_amil" = "main") => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/edit" : "api/kas/transactions/edit";
    return requestRest<KasDataResponse>("POST", endpoint, data, kasType);
  },

  duplicateTransaction: (data: Transaction, kasType: "main" | "kas_amil" = "main") => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/duplicate" : "api/kas/transactions/duplicate";
    return requestRest<KasDataResponse>("POST", endpoint, data, kasType);
  },

  deleteTransaction: (no: number, kasType: "main" | "kas_amil" = "main") => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/delete" : "api/kas/transactions/delete";
    return requestRest<KasDataResponse>("POST", endpoint, { no }, kasType);
  },

  carryForwardBalance: (monthKey: string, kasType: "main" | "kas_amil" = "main") => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/carry-forward" : "api/kas/transactions/carry-forward";
    return requestRest<KasDataResponse>("POST", endpoint, { monthKey }, kasType);
  },

  // === SHODAQOH ===
  getShodaqohData: (monthKey?: string) => {
    return requestRest<ShodaqohDataResponse>("GET", "api/shodaqoh/data", monthKey ? { month: monthKey } : {});
  },

  getShodaqohMemberDetail: (memberId: string) => {
    return requestRest<any>("GET", "api/shodaqoh/members/detail", { memberId });
  },

  getShodaqohLastNominals: (memberId: string, beforeMonth: string) => {
    return requestRest<any>("GET", "api/shodaqoh/payments/last-nominals", { memberId, beforeMonth });
  },

  getShodaqohPaymentDetail: (paymentId: string) => {
    return requestRest<any>("GET", "api/shodaqoh/payments/detail", { paymentId });
  },

  addShodaqohMember: (nama: string, nominalBulanan: number) => {
    return requestRest<any>("POST", "api/shodaqoh/members/add", { nama, nominalBulanan });
  },

  updateShodaqohMember: (memberId: string, nama: string, nominalBulanan: number) => {
    return requestRest<any>("POST", "api/shodaqoh/members/update", { memberId, nama, nominalBulanan });
  },

  deleteShodaqohMember: (memberId: string) => {
    return requestRest<any>("POST", "api/shodaqoh/members/delete", { memberId });
  },

  createShodaqohPayment: (data: Record<string, any>) => {
    return requestRest<any>("POST", "api/shodaqoh/payments/create", data);
  },

  updateShodaqohPayment: (data: Record<string, any>) => {
    return requestRest<any>("POST", "api/shodaqoh/payments/update", data);
  },

  reverseShodaqohPayment: (paymentId: string) => {
    return requestRest<any>("POST", "api/shodaqoh/payments/reverse", { paymentId });
  },

  postShodaqohToKas: (monthKey: string) => {
    return requestRest<any>("POST", "api/shodaqoh/post-to-kas", { monthKey });
  },

  cancelPostShodaqohToKas: (monthKey: string) => {
    return requestRest<any>("POST", "api/shodaqoh/cancel-post-to-kas", { monthKey });
  },

  extractShodaqohAi: (dataUrl: string) => {
    return requestRest<any>("POST", "api/shodaqoh/extract", { dataUrl });
  },

  // === ZAKAT ===
  getZakatList: () => {
    return requestRest<ZakatResponse>("GET", "api/zakat/list");
  },

  getZakatDetail: (id: string) => {
    return requestRest<any>("GET", "api/zakat/detail", { id });
  },

  getZakatMasters: () => {
    return requestRest<any>("GET", "api/zakat/masters");
  },

  manageZakat: (action: string, data: Record<string, any> = {}) => {
    return requestRest<any>("POST", "api/zakat/manage", { action, ...data });
  },

  // === AI CHAT ===
  sendAiChatQuery: (message: string, history: any[] = []) => {
    return requestRest<any>("POST", "api/ai/chat", { kasType: "main", message, history });
  },
};
