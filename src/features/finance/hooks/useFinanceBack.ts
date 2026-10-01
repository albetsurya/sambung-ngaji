import { usePermission } from "../../../hooks/usePermission";

/**
 * Back navigation simetris untuk modul keuangan.
 * - SUPER_ADMIN dengan fokus grup -> kembali ke /kelompok-saya?group_id=X (chip terjaga)
 * - SUPER_ADMIN tanpa fokus -> /kelompok-saya (pilih konteks)
 * - TIM_KU / lainnya -> /finance hub (jalur BottomNav Keuangan)
 */
export function useFinanceBack() {
  const { role, assignedGroup, isSuperAdmin } = usePermission();

  if (isSuperAdmin) {
    if (assignedGroup) {
      return {
        backTo: `/kelompok-saya?group_id=${assignedGroup}`,
        backLabel: "Kelola Kelompok",
      };
    }
    return { backTo: "/kelompok-saya", backLabel: "Kelola Kelompok" };
  }

  if (role === "TIM_KU") {
    return { backTo: "/finance", backLabel: "Keuangan" };
  }

  return { backTo: "/lainnya", backLabel: "Lainnya" };
}

/** Back untuk hub /finance sendiri: SA -> Kelola Kelompok, lainnya -> Lainnya. */
export function useFinanceHubBack() {
  const { assignedGroup, isSuperAdmin } = usePermission();
  if (isSuperAdmin) {
    if (assignedGroup) {
      return {
        backTo: `/kelompok-saya?group_id=${assignedGroup}`,
        backLabel: "Kelola Kelompok",
      };
    }
    return { backTo: "/kelompok-saya", backLabel: "Kelola Kelompok" };
  }
  return { backTo: "/lainnya", backLabel: "Lainnya" };
}
