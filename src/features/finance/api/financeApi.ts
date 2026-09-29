import { restGet, restPost, restPut, restDelete } from "../../../services/apiClient";


export type KasType = "main" | "kas_amil";

export interface Transaction {
  no?: number;
  kas_id?: string;
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
  carryover_breakdown?: string;
  connecting_fund: number;
  community_dues: number;
  outreach_fund: number;
  thousand_fund: number;
  funeral_fund: number;
  ukhro_mt: number;
  notes: string;
}

export interface ShodaqohDashboard {
  target: number;
  received: number;
  paidCount: number;
  unpaidCount: number;
  memberCount: number;
}

export interface ShodaqohDataResponse {
  success: boolean;
  message?: string;
  selected_month?: string;
  members?: ShodaqohMember[];
  payments?: ShodaqohPayment[];
  dashboard?: ShodaqohDashboard;
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

interface KasSummaryDTO {
  kas_type: string;
  transactions: any[];
  initial_balance: number;
  total_debit: number;
  total_credit: number;
  ending_balance: number;
}

function toTransaction(raw: any, idx: number): Transaction {
  const debit = Number(raw.debit ?? raw.debet ?? 0);
  const credit = Number(raw.credit ?? raw.kredit ?? 0);
  return {
    no: raw.no ?? idx + 1,
    kas_id: raw.kas_id,
    transaction_date: raw.transaction_date || raw.tanggal || "",
    account_name: raw.account_name || raw.account || "",
    description: raw.description || raw.keterangan || "",
    transaction_type: credit > debit ? "CREDIT" : "DEBIT",
    debit,
    credit,
    balance: Number(raw.balance ?? raw.saldo ?? 0),
    created_by: raw.created_by || raw.createdBy || "",
  };
}

function toMember(raw: any): ShodaqohMember {
  return {
    member_id: raw.member_id || "",
    member_name: raw.member_name || "",
    monthly_target: Number(raw.monthly_target ?? 0),
    status: raw.status || "ACTIVE",
  };
}

function toMonths(v: any): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function toPayment(raw: any): ShodaqohPayment {
  return {
    payment_id: raw.payment_id || "",
    member_id: raw.member_id || "",
    payment_date: raw.payment_date || "",
    total_amount: Number(raw.total_amount ?? 0),
    carryover_ir: Number(raw.carryover_ir ?? 0),
    carryover_months: toMonths(raw.carryover_months),
    carryover_breakdown: raw.carryover_breakdown || "",
    connecting_fund: Number(raw.connecting_fund ?? 0),
    community_dues: Number(raw.community_dues ?? 0),
    outreach_fund: Number(raw.outreach_fund ?? 0),
    thousand_fund: Number(raw.thousand_fund ?? 0),
    funeral_fund: Number(raw.funeral_fund ?? 0),
    ukhro_mt: Number(raw.ukhro_mt ?? 0),
    notes: raw.notes || "",
  };
}

function toZakat(raw: any): ZakatItem {
  return {
    zakat_id: raw.zakat_id || "",
    zakat_type: raw.zakat_type === "MAL" ? "MAL" : "FITRAH",
    muzakki_name: raw.muzakki_name || "",
    soul_count: Number(raw.soul_count ?? 1),
    total_rice_kg: Number(raw.total_rice_kg ?? 0),
    total_money_rp: Number(raw.total_money_rp ?? 0),
    status: raw.status || "PENDING",
    transaction_date: raw.transaction_date || "",
    muzakki_list: raw.muzakki_list || [],
    mustahik_list: raw.mustahik_list || [],
  };
}

function requireGroup(groupId?: string | null): string {
  if (!groupId) throw new Error("Pilih kelompok dulu sebelum membuka modul keuangan.");
  return groupId;
}

export const financeApi = {
  getKasTransactions: async (
    groupId: string | null | undefined,
    kasType: KasType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    const res = await restGet<KasSummaryDTO>("/api/v1/finance/kas", {
      group_id: gid,
      kas_type: kasType,
    });
    return {
      success: true,
      kas_type: res.kas_type,
      transactions: (res.transactions || []).map(toTransaction),
      initial_balance: Number(res.initial_balance ?? 0),
      total_debit: Number(res.total_debit ?? 0),
      total_credit: Number(res.total_credit ?? 0),
      ending_balance: Number(res.ending_balance ?? 0),
    };
  },

  addTransaction: async (
    groupId: string | null | undefined,
    data: Omit<Transaction, "no">,
    kasType: KasType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/kas", {
      group_id: gid,
      kas_type: kasType,
      tanggal: data.transaction_date,
      account_name: data.account_name,
      description: data.description,
      debit: data.debit || 0,
      credit: data.credit || 0,
    });
    return financeApi.getKasTransactions(gid, kasType);
  },

  editTransaction: async (
    groupId: string | null | undefined,
    data: Transaction,
    kasType: KasType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/kas", {
      group_id: gid,
      kas_id: data.kas_id,
      kas_type: kasType,
      tanggal: data.transaction_date,
      account_name: data.account_name,
      description: data.description,
      debit: data.debit || 0,
      credit: data.credit || 0,
    });
    return financeApi.getKasTransactions(gid, kasType);
  },

  duplicateTransaction: async (
    groupId: string | null | undefined,
    data: Transaction,
    kasType: KasType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/kas/duplicate", {
      group_id: gid,
      kas_type: kasType,
      kas_id: data.kas_id,
    });
    return financeApi.getKasTransactions(gid, kasType);
  },

  deleteTransaction: async (
    groupId: string | null | undefined,
    kasId: string,
    kasType: KasType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restDelete("/api/v1/finance/kas", { group_id: gid, kas_id: kasId });
    return financeApi.getKasTransactions(gid, kasType);
  },

  carryForwardBalance: async (
    groupId: string | null | undefined,
    monthKey: string,
    kasType: KasType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/kas/carry-forward", {
      group_id: gid,
      kas_type: kasType,
      month: monthKey,
    });
    return financeApi.getKasTransactions(gid, kasType);
  },

  getShodaqohData: async (
    groupId: string | null | undefined,
    monthKey?: string,
  ): Promise<ShodaqohDataResponse> => {
    const gid = requireGroup(groupId);
    const res = await restGet<any>("/api/v1/finance/shodaqoh", {
      group_id: gid,
      ...(monthKey ? { month: monthKey } : {}),
    });
    return {
      success: true,
      selected_month: res.selected_month,
      members: (res.members || []).map(toMember),
      payments: (res.payments || []).map(toPayment),
      dashboard: res.dashboard,
    };
  },

  addShodaqohMember: async (
    groupId: string | null | undefined,
    member_name: string,
    monthly_target: number,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/shodaqoh/members", {
      group_id: gid,
      member_name,
      monthly_target,
    });
  },

  updateShodaqohMember: async (
    groupId: string | null | undefined,
    member_id: string,
    member_name: string,
    monthly_target: number,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/shodaqoh/members", {
      group_id: gid,
      member_id,
      member_name,
      monthly_target,
    });
  },

  deleteShodaqohMember: async (
    groupId: string | null | undefined,
    member_id: string,
  ) => {
    const gid = requireGroup(groupId);
    return restDelete("/api/v1/finance/shodaqoh/members", {
      group_id: gid,
      member_id,
    });
  },

  createShodaqohPayment: async (
    groupId: string | null | undefined,
    data: Record<string, any>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/shodaqoh/payments", {
      group_id: gid,
      ...data,
    });
  },

  getShodaqohLastNominals: async (
    groupId: string | null | undefined,
    member_id: string,
  ) => {
    const gid = requireGroup(groupId);
    const res = await restGet<any>("/api/v1/finance/shodaqoh/nominals", {
      group_id: gid,
      member_id,
    });
    return { success: true, values: res };
  },

  updateShodaqohPayment: async (
    groupId: string | null | undefined,
    data: Record<string, any>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/shodaqoh/payments", {
      group_id: gid,
      ...data,
    });
  },

  reverseShodaqohPayment: async (
    groupId: string | null | undefined,
    payment_id: string,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/shodaqoh/payments/reverse", {
      group_id: gid,
      payment_id,
    });
  },

  postShodaqohToKas: async (
    groupId: string | null | undefined,
    _monthKey: string,
  ) => {
    requireGroup(groupId);
    throw new Error("Posting otomatis ke kas belum tersedia di backend baru.");
  },

  cancelPostShodaqohToKas: async (
    groupId: string | null | undefined,
    _monthKey: string,
  ) => {
    requireGroup(groupId);
    throw new Error("Pembatalan posting belum tersedia di backend baru.");
  },

  extractShodaqohAi: async (_data_url: string): Promise<any> => {
    throw new Error("Ekstraksi foto AI belum tersedia di backend baru.");
  },

  getZakatList: async (
    groupId: string | null | undefined,
  ): Promise<ZakatResponse> => {
    const gid = requireGroup(groupId);
    const res = await restGet<any[]>("/api/v1/finance/zakat", { group_id: gid });
    return { success: true, data: (res || []).map(toZakat) };
  },

  manageZakat: async (
    groupId: string | null | undefined,
    action: string,
    data: Record<string, any> = {},
  ) => {
    const gid = requireGroup(groupId);
    const zakat_id = data.zakat_id || data.id;
    if (action === "deleteZakat") {
      return restDelete("/api/v1/finance/zakat", { group_id: gid, zakat_id });
    }
    if (action === "completeZakat") {
      return restPut("/api/v1/finance/zakat/status", {
        group_id: gid,
        zakat_id,
        status: "COMPLETED",
      });
    }
    if (action === "cancelCompleteZakat") {
      return restPut("/api/v1/finance/zakat/status", {
        group_id: gid,
        zakat_id,
        status: "ACTIVE",
      });
    }
    return restPost("/api/v1/finance/zakat", {
      group_id: gid,
      zakat_id,
      zakat_type: data.zakat_type || data.tipeZakat || "FITRAH",
      muzakki_name: data.muzakki_name || data.namaMuzaki || "",
      soul_count: data.soul_count ?? data.jumlahJiwa ?? 1,
      total_rice_kg: data.total_rice_kg ?? data.totalBerasKg ?? 0,
      total_money_rp: data.total_money_rp ?? data.totalUangRp ?? 0,
      transaction_date: data.transaction_date || data.tanggal || "",
    });
  },

  sendAiChatQuery: async (
    message: string,
    history: any[] = [],
  ): Promise<{ success: boolean; message?: string; data: any }> => {
    const normalized = (history || []).map((m: any) => {
      const text =
        m.text ??
        (Array.isArray(m.parts) ? m.parts.map((p: any) => p.text || "").join("\n") : "") ??
        "";
      const role = m.role === "model" || m.role === "assistant" ? "assistant" : "user";
      return { role, text };
    });
    const res = await restPost<any>("/api/v1/ai/chat", { message, history: normalized });
    return { success: true, data: res };
  },
};
