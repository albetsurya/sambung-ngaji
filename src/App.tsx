import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { PersonalRoute } from "./components/layout/PersonalRoute";
import { MemberRoute } from "./components/layout/MemberRoute";
import { RoleRoute } from "./components/layout/RoleRoute";
import { useAuth } from "./contexts/AuthContext";
import { LoadingScreen } from "./components/ui";
import { useBackgroundSync } from "./features/member/hooks/useBackgroundSync";
import { PwaUpdatePrompt } from "./components/ui/PwaUpdatePrompt";
import { setRetryNotifier } from "./services/api";
function ApiRetryWire() {
  const { showToast } = useToast();
  useEffect(() => {
    setRetryNotifier(() =>
      showToast("Koneksi lambat, mencoba ulang…", "warning"),
    );
    return () => setRetryNotifier(null);
  }, [showToast]);
  return null;
}
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MembersListPage = lazy(() => import("./pages/MembersListPage"));
const MemberDetailPage = lazy(() => import("./pages/MemberDetailPage"));
const MemberFormPage = lazy(() => import("./pages/MemberFormPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const OthersPage = lazy(() => import("./pages/OthersPage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const GroupHubPage = lazy(() => import("./pages/GroupHubPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const AiChatPage = lazy(() => import("./pages/AiChatPage"));
const AnnouncementTemplatesPage = lazy(
  () => import("./pages/AnnouncementTemplatesPage"),
);
const JadwalPage = lazy(() => import("./pages/JadwalPage"));
const MemberHomePage = lazy(() => import("./pages/MemberHomePage"));
const FinanceGuard = lazy(() =>
  import("./features/finance/components/FinanceGuard").then((m) => ({
    default: m.FinanceGuard,
  })),
);
const FinanceLayout = lazy(() =>
  import("./features/finance/components/FinanceLayout").then((m) => ({
    default: m.FinanceLayout,
  })),
);
const FinanceLedgerPage = lazy(() =>
  import("./features/finance/pages/FinanceLedgerPage").then((m) => ({
    default: m.FinanceLedgerPage,
  })),
);
const MonthlyDuesPage = lazy(() =>
  import("./features/finance/pages/MonthlyDuesPage").then((m) => ({
    default: m.MonthlyDuesPage,
  })),
);
const ZakatPage = lazy(() =>
  import("./features/finance/pages/ZakatPage").then((m) => ({
    default: m.ZakatPage,
  })),
);
const ZakatDetailPage = lazy(() =>
  import("./features/finance/pages/ZakatDetailPage").then((m) => ({
    default: m.ZakatDetailPage,
  })),
);
const FinanceHubPage = lazy(() =>
  import("./features/finance/pages/FinanceHubPage").then((m) => ({
    default: m.FinanceHubPage,
  })),
);
const KasPrintPreviewPage = lazy(() =>
  import("./features/finance/pages/KasPrintPreviewPage").then((m) => ({
    default: m.KasPrintPreviewPage,
  })),
);
const ShodaqohPrintPreviewPage = lazy(() =>
  import("./features/finance/pages/ShodaqohPrintPreviewPage").then((m) => ({
    default: m.ShodaqohPrintPreviewPage,
  })),
);
const ZakatPrintPreviewPage = lazy(() =>
  import("./features/finance/pages/ZakatPrintPreviewPage").then((m) => ({
    default: m.ZakatPrintPreviewPage,
  })),
);
const MemberPrayerPage = lazy(() => import("./pages/MemberPrayerPage"));
const MemberDoaPage = lazy(() => import("./pages/MemberDoaPage"));
const MemberDzikirPage = lazy(() => import("./pages/MemberDzikirPage"));
const MemberQuranPage = lazy(() => import("./pages/MemberQuranPage"));
const MemberKiblatPage = lazy(() => import("./pages/MemberKiblatPage"));
const MemberMoodPage = lazy(() => import("./pages/MemberMoodPage"));
const MemberSholatJournalPage = lazy(
  () => import("./pages/MemberSholatJournalPage"),
);
const MemberPuasaPage = lazy(
  () => import("./pages/MemberPuasaPage"),
);
const MemberTahfidzPage = lazy(
  () => import("./pages/MemberTahfidzPage"),
);
const MemberSchedulePage = lazy(
  () => import("./pages/MemberSchedulePage"),
);
const MemberFridayPage = lazy(() => import("./pages/MemberFridayPage"));
const FridaySchedulesPage = lazy(
  () => import("./pages/FridaySchedulesPage"),
);
const MemberTahfidzSurahPage = lazy(
  () => import("./pages/MemberTahfidzSurahPage"),
);
const MemberQuranSurahPage = lazy(
  () => import("./pages/MemberQuranSurahPage"),
);
const MemberQuranBookmarkPage = lazy(
  () => import("./pages/MemberQuranBookmarkPage"),
);
const MemberQuranMushafPage = lazy(
  () => import("./pages/MemberQuranMushafPage"),
);
const MemberDzikirCounterPage = lazy(
  () => import("./pages/MemberDzikirCounterPage"),
);
const MemberGuidePage = lazy(() => import("./pages/MemberGuidePage"));
const MemberSettingsPage = lazy(
  () => import("./pages/MemberSettingsPage"),
);
const MemberOthersPage = lazy(
  () => import("./pages/MemberOthersPage"),
);
const MemberImportPage = lazy(
  () => import("./pages/MemberImportPage"),
);
const MemberPrivacyPage = lazy(() => import("./pages/MemberPrivacyPage"));
const MemberSelfPage = lazy(() => import("./pages/MemberSelfPage"));
const MemberEditProfilePage = lazy(
  () => import("./pages/MemberEditProfilePage"),
);
const PendingMembersPage = lazy(() => import("./pages/PendingMembersPage"));
const PendingMemberDetailPage = lazy(
  () => import("./pages/PendingMemberDetailPage"),
);
const MemberRequestsPage = lazy(() => import("./pages/MemberRequestsPage"));
const PublicRegistrationPage = lazy(
  () => import("./pages/PublicRegistrationPage"),
);
const RegistrationSuccessPage = lazy(
  () => import("./pages/RegistrationSuccessPage"),
);
const MemberAiChatPage = lazy(() => import("./pages/MemberAiChatPage"));
const MemberProgressPage = lazy(() => import("./pages/MemberProgressPage"));
const MemberAttendancePage = lazy(() => import("./pages/MemberAttendancePage"));
const MemberAttendanceRecapPage = lazy(() => import("./pages/MemberAttendanceRecapPage"));
const RecapPrintPage = lazy(() => import("./pages/RecapPrintPage"));
const FridayPrintPage = lazy(() => import("./pages/FridayPrintPage"));
const TaarufCvPrintPage = lazy(() => import("./pages/TaarufCvPrintPage"));
const AiUsagePage = lazy(() => import("./pages/AiUsagePage"));
const QrCodePage = lazy(() => import("./pages/QrCodePage"));
const PublicLandingPage = lazy(
  () => import("./pages/PublicLandingPage"),
);
const NgajiCeriaHomePage = lazy(
  () => import("./features/ngaji-ceria/pages/NgajiCeriaHomePage"),
);
function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"
          aria-label="Memuat halaman"
        />
        <p className="text-ios-caption text-surface-muted">Memuat…</p>
      </div>
    </div>
  );
}
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageFallback />;
  // Langsung tampilkan landing page saat loading, biarkan PageFallback/Suspense
  // yang lain menghandle loading di route dalam (jika perlu).
  if (!user) return <PublicLandingPage />;
  if (user.role === "MEMBER") return <Navigate to="/member" replace />;
  if (user.role === "TIM_KU") return <Navigate to="/finance/ledger" replace />;
  return <DashboardPage />;
}
/** Redirect prefix lama (Indonesia) ke prefix baru (English), query ikut terbawa. */
function PrefixRedirect({ from, to }: { from: string; to: string }) {
  const { pathname, search } = useLocation();
  const rest = pathname.slice(from.length);
  return <Navigate to={`${to}${rest}${search}`} replace />;
}
/** Redirect /jamaah/:id/cv-taaruf lama ke /members/:id/taaruf-cv. */
function LegacyTaarufCvRedirect() {
  const { id } = useParams();
  return <Navigate to={`/members/${id}/taaruf-cv`} replace />;
}
function AppRoutes() {
  useBackgroundSync();
  const location = useLocation();
  return (
    <Suspense fallback={<PageFallback />}>
      <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<PublicRegistrationPage />} />
        <Route path="/register/success" element={<RegistrationSuccessPage />} />
        <Route path="/" element={<HomeRoute />} />
        {/* Redirect legacy (URL Indonesia lama, mis. dari QR code cetak) */}
        <Route path="/daftar" element={<PrefixRedirect from="/daftar" to="/register" />} />
        <Route path="/daftar/*" element={<PrefixRedirect from="/daftar" to="/register" />} />
        <Route
          path="/member"
          element={
            <PersonalRoute>
              <MemberHomePage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/prayer"
          element={
            <MemberRoute allowGuest>
              <MemberPrayerPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/doa"
          element={
            <MemberRoute allowGuest>
              <MemberDoaPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/kiblat"
          element={
            <MemberRoute allowGuest>
              <MemberKiblatPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/ngaji-ceria"
          element={
            <MemberRoute allowGuest>
              <NgajiCeriaHomePage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/tahfidz"
          element={
            <PersonalRoute>
              <MemberTahfidzPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/jadwal"
          element={
            <MemberRoute allowGuest>
              <MemberSchedulePage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/petugas-jumat"
          element={
            <MemberRoute allowGuest>
              <MemberFridayPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/tahfidz/surah/:nomor"
          element={
            <PersonalRoute>
              <MemberTahfidzSurahPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/puasa"
          element={
            <MemberRoute allowGuest>
              <MemberPuasaPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/sholat-jurnal"
          element={
            <PersonalRoute>
              <MemberSholatJournalPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/mood"
          element={
            <MemberRoute allowGuest>
              <MemberMoodPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/quran"
          element={
            <MemberRoute allowGuest>
              <MemberQuranPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/quran/mushaf"
          element={
            <MemberRoute allowGuest>
              <MemberQuranMushafPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/quran/bookmark"
          element={
            <PersonalRoute>
              <MemberQuranBookmarkPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/quran/:nomor"
          element={
            <MemberRoute allowGuest>
              <MemberQuranSurahPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/dzikir"
          element={
            <MemberRoute allowGuest>
              <MemberDzikirPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/dzikir/:id"
          element={
            <MemberRoute allowGuest>
              <MemberDzikirCounterPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/profil"
          element={
            <PersonalRoute>
              <MemberSelfPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/panduan"
          element={
            <MemberRoute allowGuest>
              <MemberGuidePage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/lainnya"
          element={
            <PersonalRoute>
              <MemberOthersPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/settings"
          element={<Navigate to="/member/lainnya" replace />}
        />
        <Route
          path="/member/privasi"
          element={
            <PersonalRoute>
              <MemberPrivacyPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/edit"
          element={
            <PersonalRoute>
              <MemberEditProfilePage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/ai"
          element={
            <PersonalRoute>
              <MemberAiChatPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/progres"
          element={
            <PersonalRoute>
              <MemberProgressPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/rekap-absen"
          element={<Navigate to="/member/absensi" replace />}
        />
        <Route
          path="/member/absensi"
          element={
            <PersonalRoute>
              <MemberAttendancePage />
            </PersonalRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
          {/* Finance Module (Accessible by SUPER_ADMIN & TIM_KU) */}
          <Route element={<FinanceGuard />}>
            <Route path="/finance" element={<FinanceLayout />}>
              <Route index element={<FinanceHubPage />} />
              <Route path="ledger" element={<FinanceLedgerPage />} />
              <Route path="shodaqoh" element={<Navigate to="/finance/monthly-dues" replace />} />
              <Route path="monthly-dues" element={<MonthlyDuesPage />} />
              <Route path="zakat" element={<ZakatPage />} />
              <Route path="zakat/:id" element={<ZakatDetailPage />} />
              <Route path="ledger/print" element={<KasPrintPreviewPage />} />
              <Route path="monthly-dues/print" element={<ShodaqohPrintPreviewPage />} />
              <Route path="zakat/:id/print" element={<ZakatPrintPreviewPage />} />
            </Route>
          </Route>
          <Route
            path="/members"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS", "TIM_PNKB", "TIM_ABSENSI"]}>
                <MembersListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/my-group"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                <GroupHubPage />
              </RoleRoute>
            }
          />
          <Route
            path="/manage-global"
            element={<Navigate to="/my-group" replace />}
          />
          <Route path="/kelompok-saya" element={<PrefixRedirect from="/kelompok-saya" to="/my-group" />} />
          <Route path="/kelola-global" element={<Navigate to="/my-group" replace />} />
          <Route
            path="/members/new"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_PNKB"]}>
                <MemberFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/members/:id"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS", "TIM_PNKB", "TIM_ABSENSI"]}>
                <MemberDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/members/:id/taaruf-cv"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS", "TIM_PNKB", "TIM_ABSENSI"]}>
                <TaarufCvPrintPage />
              </RoleRoute>
            }
          />
          <Route
            path="/members/:id/edit"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_PNKB"]}>
                <MemberFormPage />
              </RoleRoute>
            }
          />
          <Route path="/jamaah/:id/cv-taaruf" element={<LegacyTaarufCvRedirect />} />
          <Route path="/jamaah/*" element={<PrefixRedirect from="/jamaah" to="/members" />} />
          <Route
            path="/attendance"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                <AttendancePage />
              </RoleRoute>
            }
          />
          <Route path="/absensi" element={<PrefixRedirect from="/absensi" to="/attendance" />} />
          <Route
            path="/announcements"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                <AnnouncementsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/announcements/templates"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                <AnnouncementTemplatesPage />
              </RoleRoute>
            }
          />
          <Route path="/pengumuman/*" element={<PrefixRedirect from="/pengumuman" to="/announcements" />} />
          <Route path="/my-profile" element={<MemberSelfPage />} />
          <Route path="/my-profile/edit" element={<MemberEditProfilePage />} />
          <Route path="/profil-saya/*" element={<PrefixRedirect from="/profil-saya" to="/my-profile" />} />
          <Route path="/more">
            <Route index element={<OthersPage />} />
            <Route
              path="groups"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                  <GroupsPage />
                </RoleRoute>
              }
            />
            <Route
              path="registrants"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <PendingMembersPage />
                </RoleRoute>
              }
            />
            <Route
              path="registrants/:submission_id"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <PendingMemberDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="member-requests"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <MemberRequestsPage />
                </RoleRoute>
              }
            />
            <Route
              path="qr-code"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <QrCodePage />
                </RoleRoute>
              }
            />
            <Route
              path="ai-usage"
              element={
                <RoleRoute allowed={["SUPER_ADMIN"]}>
                  <AiUsagePage />
                </RoleRoute>
              }
            />
            <Route
              path="users"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <UsersPage />
                </RoleRoute>
              }
            />
            <Route
              path="audit-log"
              element={
                <RoleRoute allowed={["SUPER_ADMIN"]}>
                  <AuditLogPage />
                </RoleRoute>
              }
            />
            <Route
              path="schedule"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <JadwalPage />
                </RoleRoute>
              }
            />
            <Route
              path="friday-officers"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <FridaySchedulesPage />
                </RoleRoute>
              }
            />
            <Route
              path="friday-officers/print"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <FridayPrintPage />
                </RoleRoute>
              }
            />
            <Route
              path="import-members"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <MemberImportPage />
                </RoleRoute>
              }
            />
            <Route
              path="attendance-recap"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <MemberAttendanceRecapPage />
                </RoleRoute>
              }
            />
            <Route
              path="attendance-recap/print"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <RecapPrintPage />
                </RoleRoute>
              }
            />
          </Route>
          {/* Redirect legacy /lainnya/* (segmen ikut diterjemahkan satu per satu) */}
          <Route path="/lainnya/kelompok" element={<Navigate to="/more/groups" replace />} />
          <Route path="/lainnya/pendaftar" element={<Navigate to="/more/registrants" replace />} />
          <Route path="/lainnya/pendaftar/:submission_id" element={<PrefixRedirect from="/lainnya/pendaftar" to="/more/registrants" />} />
          <Route path="/lainnya/permintaan-member" element={<Navigate to="/more/member-requests" replace />} />
          <Route path="/lainnya/import-jamaah" element={<Navigate to="/more/import-members" replace />} />
          <Route path="/lainnya/jadwal" element={<PrefixRedirect from="/lainnya/jadwal" to="/more/schedule" />} />
          <Route path="/lainnya/rekap-absensi/cetak" element={<PrefixRedirect from="/lainnya/rekap-absensi/cetak" to="/more/attendance-recap/print" />} />
          <Route path="/lainnya/rekap-absensi" element={<PrefixRedirect from="/lainnya/rekap-absensi" to="/more/attendance-recap" />} />
          <Route path="/lainnya/petugas-jumat/cetak" element={<PrefixRedirect from="/lainnya/petugas-jumat/cetak" to="/more/friday-officers/print" />} />
          <Route path="/lainnya/petugas-jumat" element={<PrefixRedirect from="/lainnya/petugas-jumat" to="/more/friday-officers" />} />
          <Route path="/lainnya/*" element={<PrefixRedirect from="/lainnya" to="/more" />} />
          <Route path="/ai-chat" element={<AiChatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </Suspense>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
            <PwaUpdatePrompt />
            <ApiRetryWire />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
