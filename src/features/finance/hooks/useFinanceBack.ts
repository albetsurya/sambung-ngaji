import { usePermission } from "../../../hooks/usePermission";

/**
 * Back navigation simetris untuk modul keuangan.
 * - SUPER_ADMIN dengan fokus grup -> kembali ke /my-group?group_id=X (chip terjaga)
 * - SUPER_ADMIN tanpa fokus -> /my-group (pilih konteks)
 * - TIM_KU / lainnya -> /finance hub (jalur BottomNav Keuangan)
 */
export function useFinanceBack() {
  const { role, assignedGroup, isSuperAdmin } = usePermission();

  if (isSuperAdmin) {
    if (assignedGroup) {
      return {
        backTo: `/my-group?group_id=${assignedGroup}`,
        backLabel: "Kelola Kelompok",
      };
    }
    return { backTo: "/my-group", backLabel: "Kelola Kelompok" };
  }

  if (role === "TIM_KU") {
    return { backTo: "/finance", backLabel: "Keuangan" };
  }

  return { backTo: "/more", backLabel: "Lainnya" };
}

/** Back untuk hub /finance sendiri: SA -> Kelola Kelompok, lainnya -> Lainnya. */
export function useFinanceHubBack() {
  const { assignedGroup, isSuperAdmin } = usePermission();
  if (isSuperAdmin) {
    if (assignedGroup) {
      return {
        backTo: `/my-group?group_id=${assignedGroup}`,
        backLabel: "Kelola Kelompok",
      };
    }
    return { backTo: "/my-group", backLabel: "Kelola Kelompok" };
  }
  return { backTo: "/more", backLabel: "Lainnya" };
}
