const GAS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwqCvr9HQvij6g1q3r0tlxfCu3Slb8xhTCdIZ80jYNXdJIVTOtHHSwmEauU3CLt-yd2/exec";

// === SNAKE_CASE & ENGLISH INTERFACES ===

export interface Transaction {
  no?: number;
  transaction_date: string;
  account_name?: string;
  description: string;
  transaction_type?: "DEBIT" | "CREDIT";
  debit?: number;
  credit?: number;
  balance?: number;
  created_by?: string;
}

export interface KasDataResponse {
  success: boolean;
  message?: string;
  kas_type?: string;
  transactions?: Transaction[];
  initial_balance?: number;
  total_debit?: number;
  total_credit?: number;
  ending_balance?: number;
}

export interface ShodaqohMember {
  member_id: string;
  member_name: string;
  monthly_target: number;
  status: string;
}

export interface ShodaqohPayment {
  payment_id: string;
  member_id: string;
  payment_date: string;
  total_amount: number;
  carryover_ir: number;
  carryover_months: string[];
  uang_sambung: number;
  jimpitan: number;
  siar_siar: number;
  seribuan: number;
  kafan: number;
  ukhro_mt: number;
  notes: string;
}

export interface ShodaqohDataResponse {
  success: boolean;
  message?: string;
  selected_month?: string;
  members?: ShodaqohMember[];
  payments?: ShodaqohPayment[];
  recap?: Record<string, any>;
}

export interface ZakatItem {
  zakat_id: string;
  zakat_type: "FITRAH" | "MAL";
  muzakki_name: string;
  soul_count: number;
  total_rice_kg: number;
  total_money_rp: number;
  status: string;
  transaction_date: string;
  muzakki_list?: any[];
  mustahik_list?: any[];
}

export interface ZakatResponse {
  success: boolean;
  message?: string;
  data?: ZakatItem[];
}

// === HELPER TRANSFORMERS ===

function transformTransactionFromBackend(raw: any): Transaction {
  return {
    no: raw.no,
    transaction_date: raw.tanggal || raw.transaction_date || "",
    account_name: raw.account || raw.account_name || "",
    description: raw.keterangan || raw.description || "",
    transaction_type: raw.jenis === "Kredit" || raw.transaction_type === "CREDIT" ? "CREDIT" : "DEBIT",
    debit: Number(raw.debet ?? raw.debit ?? 0),
    credit: Number(raw.kredit ?? raw.credit ?? 0),
    balance: Number(raw.saldo ?? raw.balance ?? 0),
    created_by: raw.createdBy || raw.created_by || "",
  };
}

function transformKasResponseFromBackend(raw: any): KasDataResponse {
  return {
    success: !!raw.success,
    message: raw.message,
    kas_type: raw.kasType || raw.kas_type,
    transactions: (raw.transactions || []).map(transformTransactionFromBackend),
    initial_balance: Number(raw.saldoAwal ?? raw.initial_balance ?? 0),
    total_debit: Number(raw.totalDebet ?? raw.total_debit ?? 0),
    total_credit: Number(raw.totalKredit ?? raw.total_credit ?? 0),
    ending_balance: Number(raw.saldoAkhir ?? raw.ending_balance ?? 0),
  };
}

function transformShodaqohMemberFromBackend(raw: any): ShodaqohMember {
  return {
    member_id: raw.id || raw.member_id || "",
    member_name: raw.nama || raw.member_name || "",
    monthly_target: Number(raw.nominalBulanan ?? raw.monthly_target ?? 0),
    status: raw.status || "ACTIVE",
  };
}

function transformShodaqohPaymentFromBackend(raw: any): ShodaqohPayment {
  return {
    payment_id: raw.paymentId || raw.payment_id || "",
    member_id: raw.memberId || raw.member_id || "",
    payment_date: raw.tanggalPembayaran || raw.payment_date || "",
    total_amount: Number(raw.total ?? raw.total_amount ?? 0),
    carryover_ir: Number(raw.susulan_ir ?? raw.carryover_ir ?? 0),
    carryover_months: raw.susulan_bulan || raw.carryover_months || [],
    uang_sambung: Number(raw.uang_sambung ?? 0),
    jimpitan: Number(raw.jimpitan ?? 0),
    siar_siar: Number(raw.siar_siar ?? 0),
    seribuan: Number(raw.seribuan ?? 0),
    kafan: Number(raw.kafan ?? 0),
    ukhro_mt: Number(raw.ukhro_mt ?? 0),
    notes: raw.keterangan || raw.notes || "",
  };
}

function transformZakatItemFromBackend(raw: any): ZakatItem {
  return {
    zakat_id: raw.id || raw.zakat_id || "",
    zakat_type: raw.tipeZakat || raw.zakat_type || "FITRAH",
    muzakki_name: raw.namaMuzaki || raw.muzakki_name || "",
    soul_count: Number(raw.jumlahJiwa ?? raw.soul_count ?? 1),
    total_rice_kg: Number(raw.totalBerasKg ?? raw.total_rice_kg ?? 0),
    total_money_rp: Number(raw.totalUangRp ?? raw.total_money_rp ?? 0),
    status: raw.status || "PENDING",
    transaction_date: raw.tanggal || raw.transaction_date || "",
    muzakki_list: raw.muzakiList || raw.muzakki_list || [],
    mustahik_list: raw.mustahikList || raw.mustahik_list || [],
  };
}

async function requestRest<T>(
  method: "GET" | "POST",
  endpoint: string,
  paramsOrBody: Record<string, any> = {},
  kasType: "main" | "kas_amil" = "main"
): Promise<any> {
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
  getKasTransactions: async (kasType: "main" | "kas_amil" = "main"): Promise<KasDataResponse> => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions" : "api/kas/transactions";
    const res = await requestRest("GET", endpoint, {}, kasType);
    return transformKasResponseFromBackend(res);
  },

  addTransaction: async (data: Omit<Transaction, "no">, kasType: "main" | "kas_amil" = "main"): Promise<KasDataResponse> => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/add" : "api/kas/transactions/add";
    const payload = {
      tanggal: data.transaction_date,
      account: data.account_name,
      keterangan: data.description,
      debet: data.debit || 0,
      kredit: data.credit || 0,
    };
    const res = await requestRest("POST", endpoint, payload, kasType);
    return transformKasResponseFromBackend(res);
  },

  editTransaction: async (data: Transaction, kasType: "main" | "kas_amil" = "main"): Promise<KasDataResponse> => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/edit" : "api/kas/transactions/edit";
    const payload = {
      no: data.no,
      tanggal: data.transaction_date,
      account: data.account_name,
      keterangan: data.description,
      debet: data.debit || 0,
      kredit: data.credit || 0,
    };
    const res = await requestRest("POST", endpoint, payload, kasType);
    return transformKasResponseFromBackend(res);
  },

  duplicateTransaction: async (data: Transaction, kasType: "main" | "kas_amil" = "main"): Promise<KasDataResponse> => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/duplicate" : "api/kas/transactions/duplicate";
    const payload = {
      no: data.no,
      tanggal: data.transaction_date,
      account: data.account_name,
      keterangan: data.description,
      debet: data.debit || 0,
      kredit: data.credit || 0,
    };
    const res = await requestRest("POST", endpoint, payload, kasType);
    return transformKasResponseFromBackend(res);
  },

  deleteTransaction: async (no: number, kasType: "main" | "kas_amil" = "main"): Promise<KasDataResponse> => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/delete" : "api/kas/transactions/delete";
    const res = await requestRest("POST", endpoint, { no }, kasType);
    return transformKasResponseFromBackend(res);
  },

  carryForwardBalance: async (monthKey: string, kasType: "main" | "kas_amil" = "main"): Promise<KasDataResponse> => {
    const endpoint = kasType === "kas_amil" ? "api/kas-amil/transactions/carry-forward" : "api/kas/transactions/carry-forward";
    const res = await requestRest("POST", endpoint, { monthKey }, kasType);
    return transformKasResponseFromBackend(res);
  },

  // === SHODAQOH ===
  getShodaqohData: async (monthKey?: string): Promise<ShodaqohDataResponse> => {
    const res = await requestRest("GET", "api/shodaqoh/data", monthKey ? { month: monthKey } : {});
    return {
      success: !!res.success,
      message: res.message,
      selected_month: res.selectedMonth || res.selected_month,
      members: (res.members || []).map(transformShodaqohMemberFromBackend),
      payments: (res.payments || []).map(transformShodaqohPaymentFromBackend),
      recap: res.recap || {},
    };
  },

  addShodaqohMember: async (member_name: string, monthly_target: number) => {
    return requestRest("POST", "api/shodaqoh/members/add", { nama: member_name, nominalBulanan: monthly_target });
  },

  updateShodaqohMember: async (member_id: string, member_name: string, monthly_target: number) => {
    return requestRest("POST", "api/shodaqoh/members/update", { memberId: member_id, nama: member_name, nominalBulanan: monthly_target });
  },

  deleteShodaqohMember: async (member_id: string) => {
    return requestRest("POST", "api/shodaqoh/members/delete", { memberId: member_id });
  },

  createShodaqohPayment: async (data: Record<string, any>) => {
    return requestRest("POST", "api/shodaqoh/payments/create", data);
  },

  getShodaqohLastNominals: async (member_id: string, monthKey: string) => {
    return requestRest("GET", "api/shodaqoh/last-nominals", { memberId: member_id, month: monthKey });
  },

  updateShodaqohPayment: async (data: Record<string, any>) => {
    return requestRest("POST", "api/shodaqoh/payments/update", data);
  },

  reverseShodaqohPayment: async (payment_id: string) => {
    return requestRest("POST", "api/shodaqoh/payments/reverse", { paymentId: payment_id });
  },

  postShodaqohToKas: async (monthKey: string) => {
    return requestRest("POST", "api/shodaqoh/post-to-kas", { monthKey });
  },

  cancelPostShodaqohToKas: async (monthKey: string) => {
    return requestRest("POST", "api/shodaqoh/cancel-post-to-kas", { monthKey });
  },

  extractShodaqohAi: async (data_url: string) => {
    return requestRest("POST", "api/shodaqoh/extract", { dataUrl: data_url });
  },

  // === ZAKAT ===
  getZakatList: async (): Promise<ZakatResponse> => {
    const res = await requestRest("GET", "api/zakat/list");
    return {
      success: !!res.success,
      message: res.message,
      data: (res.data || []).map(transformZakatItemFromBackend),
    };
  },

  manageZakat: async (action: string, data: Record<string, any> = {}) => {
    const payload = {
      action,
      id: data.zakat_id || data.id,
      tipeZakat: data.zakat_type || data.tipeZakat,
      namaMuzaki: data.muzakki_name || data.namaMuzaki,
      jumlahJiwa: data.soul_count ?? data.jumlahJiwa,
      totalBerasKg: data.total_rice_kg ?? data.totalBerasKg,
      totalUangRp: data.total_money_rp ?? data.totalUangRp,
    };
    return requestRest("POST", "api/zakat/manage", payload);
  },

  // === AI CHAT ===
  sendAiChatQuery: async (message: string, history: any[] = []) => {
    return requestRest("POST", "api/ai/chat", { kasType: "main", message, history });
  },
};
