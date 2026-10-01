import { restGet, restPost, restPut, restDelete } from "../../../services/apiClient";
export type CashType = "main" | "amil";
export interface Transaction {
  no?: number;
  cash_id?: string;
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
  cash_type?: string;
  transactions?: Transaction[];
  initial_balance?: number;
  total_debit?: number;
  total_credit?: number;
  ending_balance?: number;
}
export interface DueMember {
  member_id: string;
  member_name: string;
  monthly_target: number;
  status: string;
}
export interface DuePaymentCarryoverItem {
  month: string; // YYYY-MM
  amount: number;
}
export interface DuePayment {
  payment_id: string;
  member_id: string;
  payment_date: string;
  total_amount: number;
  carryover_ir: number;
  carryover_months: string[];
  carryover_items: DuePaymentCarryoverItem[];
  connecting_fund: number;
  community_dues: number;
  outreach_fund: number;
  thousand_fund: number;
  funeral_fund: number;
  ukhro_mt: number;
  notes: string;
  status?: string;
}
export interface DuesDashboard {
  target: number;
  received: number;
  paidCount: number;
  unpaidCount: number;
  memberCount: number;
}
export interface DuesDataResponse {
  success: boolean;
  message?: string;
  selected_month?: string;
  members?: DueMember[];
  payments?: DuePayment[];
  dashboard?: DuesDashboard;
  recap?: Record<string, any>;
}
export interface ZakatAllocGroup {
  percent: number;
  amount: number;
  group?: ZakatAllocGroup;
  region?: ZakatAllocGroup;
  village?: ZakatAllocGroup;
}
export interface ZakatAllocCategory {
  total: number;
  recipient: ZakatAllocGroup;
  sabilillah: ZakatAllocGroup;
  amil: ZakatAllocGroup;
}
export interface ZakatAllocations {
  fitrah?: ZakatAllocCategory | null;
  maal?: ZakatAllocCategory | null;
  by_category?: Record<string, ZakatAllocCategory | null>;
}
export const ZAKAT_CATEGORIES = [
  { value: "FITRAH", label: "Fitrah", needsSoul: true },
  { value: "MAL", label: "Mal", needsSoul: false },
  { value: "TIJAROH", label: "Tijaroh", needsSoul: false },
  { value: "ZURU", label: "Zuru'", needsSoul: false },
  { value: "LIVESTOCK", label: "Ternak", needsSoul: false },
  { value: "OTHER", label: "Lainnya", needsSoul: false },
] as const;
export type ZakatCategory = (typeof ZAKAT_CATEGORIES)[number]["value"];
export function normZakatCategory(v: unknown): string {
  const s = String(v ?? "").toUpperCase().trim().replace(/^ZAKAT\s+/, "").replace(/^'+|'+$/g, "");
  switch (s) {
    case "FITRAH":
    case "FITR":
      return "FITRAH";
    case "MAL":
    case "MAAL":
      return "MAL";
    case "TIJAROH":
    case "TIJARAH":
    case "DAGANG":
      return "TIJAROH";
    case "ZURU":
    case "ZIRA'AH":
    case "ZIRAAH":
    case "PERTANIAN":
      return "ZURU";
    case "LIVESTOCK":
    case "TERNAK":
      return "LIVESTOCK";
    case "OTHER":
    case "LAINNYA":
    case "LAIN-LAIN":
      return "OTHER";
    default:
      return "FITRAH";
  }
}
export function zakatCategoryLabel(v: unknown): string {
  const cat = normZakatCategory(v);
  return ZAKAT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}
export interface ZakatPayer {
  payer_id: string;
  master_id?: string;
  name: string;
  amount: number;
  zakat_category?: string;
  family_members_count?: number;
  sort_order?: number;
}
export interface ZakatRecipient {
  recipient_id: string;
  master_id?: string;
  name: string;
  amount: number;
  zakat_category?: string;
  sort_order?: number;
}
export interface ZakatItem {
  zakat_id: string;
  title?: string;
  description?: string;
  location?: string;
  categories: string[];
  soul_count: number;
  total_rice_kg: number;
  total_money_rp: number;
  status: string;
  transaction_date: string;
  completed_at?: string;
  version?: number;
  payer_count?: number;
  recipient_count?: number;
  payer_list?: ZakatPayer[];
  recipient_list?: ZakatRecipient[];
  allocations?: ZakatAllocations | null;
  muzakki_list?: any[];
  mustahik_list?: any[];
}
export interface ZakatResponse {
  success: boolean;
  message?: string;
  data?: ZakatItem[];
}
interface KasSummaryDTO {
  cash_type: string;
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
    cash_id: raw.cash_id ?? (raw as any).kas_id,
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
function toMember(raw: any): DueMember {
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
function toCarryoverItems(v: any): DuePaymentCarryoverItem[] {
  const raw = Array.isArray(v) ? v : [];
  return raw
    .map((it: any) => ({
      month: String(it?.month || ""),
      amount: Number(it?.amount ?? 0),
    }))
    .filter((it) => it.month && it.amount > 0);
}
function toPayment(raw: any): DuePayment {
  return {
    payment_id: raw.payment_id || "",
    member_id: raw.member_id || "",
    payment_date: raw.payment_date || "",
    total_amount: Number(raw.total_amount ?? 0),
    carryover_ir: Number(raw.carryover_ir ?? 0),
    carryover_months: toMonths(raw.carryover_months),
    carryover_items: toCarryoverItems(raw.carryover_items),
    connecting_fund: Number(raw.connecting_fund ?? 0),
    community_dues: Number(raw.community_dues ?? 0),
    outreach_fund: Number(raw.outreach_fund ?? 0),
    thousand_fund: Number(raw.thousand_fund ?? 0),
    funeral_fund: Number(raw.funeral_fund ?? 0),
    ukhro_mt: Number(raw.ukhro_mt ?? 0),
    notes: raw.notes || "",
    status: raw.status || "ACTIVE",
  };
}
function toZakat(raw: any): ZakatItem {
  const normList = (arr: any): any[] =>
    (Array.isArray(arr) ? arr : []).map((p: any) =>
      p && typeof p === "object" && "zakat_category" in p
        ? { ...p, zakat_category: normZakatCategory((p as any).zakat_category) }
        : p,
    );
  return {
    zakat_id: raw.zakat_id || "",
    title: raw.title || "",
    description: raw.description || "",
    location: raw.location || "",
    categories: Array.isArray(raw.categories)
      ? raw.categories.map((c: any) => normZakatCategory(c))
      : [],
    soul_count: Number(raw.soul_count ?? 0),
    total_rice_kg: Number(raw.total_rice_kg ?? 0),
    total_money_rp: Number(raw.total_money_rp ?? 0),
    status: raw.status || "PENDING",
    transaction_date: raw.transaction_date || "",
    completed_at: raw.completed_at || "",
    version: Number(raw.version ?? 1),
    payer_count: Number(raw.payer_count ?? 0),
    recipient_count: Number(raw.recipient_count ?? 0),
    payer_list: normList(raw.payer_list),
    recipient_list: normList(raw.recipient_list),
    allocations: raw.allocations || null,
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
    cashType: CashType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    const res = await restGet<KasSummaryDTO>("/api/v1/finance/cash-ledger", {
      group_id: gid,
      cash_type: cashType,
    });
    return {
      success: true,
      cash_type: res.cash_type,
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
    cashType: CashType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/cash-ledger", {
      group_id: gid,
      cash_type: cashType,
      tanggal: data.transaction_date,
      account_name: data.account_name,
      description: data.description,
      debit: data.debit || 0,
      credit: data.credit || 0,
    });
    return financeApi.getKasTransactions(gid, cashType);
  },
  editTransaction: async (
    groupId: string | null | undefined,
    data: Transaction,
    cashType: CashType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/cash-ledger", {
      group_id: gid,
      cash_id: data.cash_id,
      cash_type: cashType,
      tanggal: data.transaction_date,
      account_name: data.account_name,
      description: data.description,
      debit: data.debit || 0,
      credit: data.credit || 0,
    });
    return financeApi.getKasTransactions(gid, cashType);
  },
  duplicateTransaction: async (
    groupId: string | null | undefined,
    data: Transaction,
    cashType: CashType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/cash-ledger/duplicate", {
      group_id: gid,
      cash_type: cashType,
      cash_id: data.cash_id,
    });
    return financeApi.getKasTransactions(gid, cashType);
  },
  deleteTransaction: async (
    groupId: string | null | undefined,
    kasId: string,
    cashType: CashType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restDelete("/api/v1/finance/cash-ledger", { group_id: gid, kas_id: kasId });
    return financeApi.getKasTransactions(gid, cashType);
  },
  carryForwardBalance: async (
    groupId: string | null | undefined,
    monthKey: string,
    cashType: CashType = "main",
  ): Promise<KasDataResponse> => {
    const gid = requireGroup(groupId);
    await restPost("/api/v1/finance/cash-ledger/carry-forward", {
      group_id: gid,
      cash_type: cashType,
      month: monthKey,
    });
    return financeApi.getKasTransactions(gid, cashType);
  },
  getShodaqohData: async (
    groupId: string | null | undefined,
    monthKey?: string,
  ): Promise<DuesDataResponse> => {
    const gid = requireGroup(groupId);
    const res = await restGet<any>("/api/v1/finance/monthly-dues", {
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
  /**
   * Rekap 1 tahun penuh (Jan–Des) untuk tabel rincian 12 bulan.
   * Tanpa filter bulan -> backend mengembalikan semua payments + members,
   * diagregat per bulan di client. Dipakai halaman Shodaqoh.
   */
  getShodaqohYearly: async (
    groupId: string | null | undefined,
  ): Promise<{ members: DueMember[]; payments: DuePayment[] }> => {
    const gid = requireGroup(groupId);
    const res = await restGet<any>("/api/v1/finance/monthly-dues", { group_id: gid });
    return {
      members: (res.members || []).map(toMember),
      payments: (res.payments || []).map(toPayment),
    };
  },
  syncFromSheet: async (
    groupId?: string | null,
  ): Promise<{ syncedGroup?: string; synced?: string }> => {
    const res = await restPost<any>(
      "/api/v1/finance/sync",
      groupId ? { group_id: groupId } : {},
    );
    return {
      syncedGroup: res.synced_group,
      synced: res.synced,
    };
  },
  addDueMember: async (
    groupId: string | null | undefined,
    member_name: string,
    monthly_target: number,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/members", {
      group_id: gid,
      member_name,
      monthly_target,
    });
  },
  updateDueMember: async (
    groupId: string | null | undefined,
    member_id: string,
    member_name: string,
    monthly_target: number,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/members", {
      group_id: gid,
      member_id,
      member_name,
      monthly_target,
    });
  },
  deleteDueMember: async (
    groupId: string | null | undefined,
    member_id: string,
  ) => {
    const gid = requireGroup(groupId);
    return restDelete("/api/v1/finance/monthly-dues/members", {
      group_id: gid,
      member_id,
    });
  },
  createDuePayment: async (
    groupId: string | null | undefined,
    data: Record<string, any>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/payments", {
      group_id: gid,
      ...data,
    });
  },
  getShodaqohLastNominals: async (
    groupId: string | null | undefined,
    member_id: string,
  ) => {
    const gid = requireGroup(groupId);
    const res = await restGet<any>("/api/v1/finance/monthly-dues/last-nominals", {
      group_id: gid,
      member_id,
    });
    return { success: true, values: res };
  },
  updateDuePayment: async (
    groupId: string | null | undefined,
    data: Record<string, any>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/payments", {
      group_id: gid,
      ...data,
    });
  },
  reverseDuePayment: async (
    groupId: string | null | undefined,
    payment_id: string,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/payments/reverse", {
      group_id: gid,
      payment_id,
    });
  },
  postShodaqohToKas: async (
    groupId: string | null | undefined,
    monthKey: string,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/post-to-kas", {
      group_id: gid,
      month: monthKey,
    });
  },
  cancelPostShodaqohToKas: async (
    groupId: string | null | undefined,
    monthKey: string,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/monthly-dues/cancel-post-to-kas", {
      group_id: gid,
      month: monthKey,
    });
  },
  extractShodaqohAi: async (_data_url: string): Promise<any> => {
    throw new Error("Ekstraksi foto AI belum tersedia di backend baru.");
  },
  getZakatMasters: async (groupId: string | null | undefined) => {
    const gid = requireGroup(groupId);
    return restGet<any>("/api/v1/finance/zakat/masters", { group_id: gid });
  },
  saveZakatPayers: async (
    groupId: string | null | undefined,
    zakat_id: string,
    payers: Array<Record<string, any>>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/zakat/payers", { group_id: gid, zakat_id, payers });
  },
  saveZakatRecipients: async (
    groupId: string | null | undefined,
    zakat_id: string,
    recipients: Array<Record<string, any>>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/zakat/recipients", { group_id: gid, zakat_id, recipients });
  },
  saveZakatAllocations: async (
    groupId: string | null | undefined,
    zakat_id: string,
    allocations: Array<Record<string, any>>,
  ) => {
    const gid = requireGroup(groupId);
    return restPost("/api/v1/finance/zakat/allocations", { group_id: gid, zakat_id, allocations });
  },
  getZakatList: async (
    groupId: string | null | undefined,
  ): Promise<ZakatResponse> => {
    const gid = requireGroup(groupId);
    const res = await restGet<any[]>("/api/v1/finance/zakat", { group_id: gid });
    return { success: true, data: (res || []).map(toZakat) };
  },
  getZakatDetail: async (
    groupId: string | null | undefined,
    zakatId: string,
  ): Promise<ZakatItem> => {
    const gid = requireGroup(groupId);
    const res = await restGet<any>("/api/v1/finance/zakat/detail", {
      group_id: gid,
      zakat_id: zakatId,
    });
    return toZakat(res);
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
      title: data.title || "",
      description: data.description || data.keterangan || "",
      location: data.location || data.tempat || "",
      soul_count: data.soul_count ?? data.jumlahJiwa ?? 0,
      total_rice_kg: data.total_rice_kg ?? data.totalBerasKg ?? 0,
      total_money_rp: data.total_money_rp ?? data.totalUangRp ?? 0,
      transaction_date: data.transaction_date || data.tanggal || "",
    });
  },
};
