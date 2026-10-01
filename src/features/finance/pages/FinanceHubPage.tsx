import { useNavigate } from "react-router-dom";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { GroupedList, ListRow, ChevronRow, EmptyState, Button } from "../../../components/ui";
import { Landmark, Heart, ScrollText } from "../../../components/ui/FontAwesomeIcons";
import { usePermission } from "../../../hooks/usePermission";
import { useFinanceHubBack } from "../hooks/useFinanceBack";

/**
 * Hub Keuangan — ringkas 3 modul (Kas/Shodaqoh/Zakat) dalam 1 pintu.
 * Menggantikan 3 item bottom-nav terpisah agar nav max 5 item dan nyaman di mobile.
 */
export const FinanceHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { assignedGroup, isSuperAdmin } = usePermission();
  const hubBack = useFinanceHubBack();
  const items = [
    { key: "kas", label: "Kas Transaksi", desc: "Kas utama & amil, rekap, cetak", to: "/finance/ledger", Icon: Landmark },
    { key: "shodaqoh", label: "Shodaqoh", desc: "Iuran, susulan IR, posting ke kas", to: "/finance/monthly-dues", Icon: Heart },
    { key: "zakat", label: "Zakat", desc: "Muzaki, rincian, mustahik", to: "/finance/zakat", Icon: ScrollText },
  ];
  return (
    <AppLayout>
      <Header title="Keuangan" subtitle="Kas · Shodaqoh · Zakat" onBack={() => navigate(hubBack.backTo)} backLabel={hubBack.backLabel} showSyncButton={false} />
      <div className="py-4">
        {isSuperAdmin && !assignedGroup ? (
          <div className="px-4">
            <EmptyState
              title="Pilih 1 kelompok dulu"
              description="Keuangan bersifat per-kelompok agar tidak tercampur. Pilih kelompok, lalu buka Kas / Shodaqoh / Zakat."
              action={<Button size="sm" onClick={() => navigate("/kelompok-saya")}>Pilih Kelompok</Button>}
            />
          </div>
        ) : (
          <GroupedList>
            {items.map((m, i) => {
              const Icon = m.Icon;
              return (
                <ListRow key={m.key} onClick={() => navigate(m.to)} insetDivider={i !== items.length - 1}
                  leading={<span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0"><Icon size={16} /></span>}>
                  <ChevronRow>
                    <div className="min-w-0 flex-1">
                      <p className="text-ios-body font-medium truncate">{m.label}</p>
                      <p className="text-ios-caption text-surface-muted truncate">{m.desc}</p>
                    </div>
                  </ChevronRow>
                </ListRow>
              );
            })}
          </GroupedList>
        )}
      </div>
    </AppLayout>
  );
};
