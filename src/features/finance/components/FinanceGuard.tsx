import React from "react";
import { Outlet } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout } from "../../../components/layout/AppLayout";
import { Button, EmptyState } from "../../../components/ui";
import { Lock } from "../../../components/ui/FontAwesomeIcons";

export const FinanceGuard: React.FC = () => {
  const { canAccessFinance, role } = usePermission();

  if (!canAccessFinance) {
    return (
      <AppLayout>
        <div className="py-4">
          <EmptyState
            title="Akses Terkunci"
            description={`Modul Keuangan (SabilKas) khusus untuk Super Admin dan Tim KU. Peran Anda (${role || "Tamu"}) tidak memiliki hak akses.`}
            icon={<Lock size={26} className="text-danger" />}
            action={
              <Button size="sm" variant="secondary" onClick={() => window.history.back()}>
                Kembali
              </Button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return <Outlet />;
};
