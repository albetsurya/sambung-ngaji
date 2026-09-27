import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { PersonalRoute } from "./components/layout/PersonalRoute";
import { MemberRoute } from "./components/layout/MemberRoute";
import { RoleRoute } from "./components/layout/RoleRoute";
import { useAuth } from "./contexts/AuthContext";
import { LoadingScreen } from "./components/common";
import { useBackgroundSync } from "./hooks/useBackgroundSync";
import { PwaUpdatePrompt } from "./components/common/PwaUpdatePrompt";
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
  if (loading) return <LoadingScreen label="Memuat..." />;
  if (!user) return <PublicLandingPage />;
  if (user.role === "MEMBER") return <Navigate to="/member" replace />;
  return <DashboardPage />;
}

function AppRoutes() {
  useBackgroundSync();
  const location = useLocation();

  return (
    <Suspense fallback={<PageFallback />}>
      <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/daftar" element={<PublicRegistrationPage />} />
        <Route path="/daftar/sukses" element={<RegistrationSuccessPage />} />
        <Route path="/" element={<HomeRoute />} />

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
          <Route
            path="/jamaah"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS", "TIM_PNKB"]}>
                <MembersListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/kelompok-saya"
            element={
              <RoleRoute allowed={["ADMIN", "PENGAWAS"]}>
                <GroupHubPage />
              </RoleRoute>
            }
          />
          <Route
            path="/jamaah/baru"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                <MemberFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/jamaah/:id"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS", "TIM_PNKB"]}>
                <MemberDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/jamaah/:id/cv-taaruf"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS", "TIM_PNKB"]}>
                <TaarufCvPrintPage />
              </RoleRoute>
            }
          />
          <Route
            path="/jamaah/:id/edit"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                <MemberFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/absensi"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                <AttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/pengumuman"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                <AnnouncementsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pengumuman/templates"
            element={
              <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                <AnnouncementTemplatesPage />
              </RoleRoute>
            }
          />
          <Route path="/profil-saya" element={<MemberSelfPage />} />
          <Route path="/profil-saya/edit" element={<MemberEditProfilePage />} />

          <Route path="/lainnya">
            <Route index element={<OthersPage />} />
            <Route
              path="kelompok"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "PENGAWAS"]}>
                  <GroupsPage />
                </RoleRoute>
              }
            />
            <Route
              path="pendaftar"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <PendingMembersPage />
                </RoleRoute>
              }
            />
            <Route
              path="pendaftar/:submission_id"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <PendingMemberDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="permintaan-member"
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
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <AiUsagePage />
                </RoleRoute>
              }
            />
            <Route
              path="users"
              element={
                <RoleRoute allowed={["SUPER_ADMIN"]}>
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
              path="jadwal"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI"]}>
                  <JadwalPage />
                </RoleRoute>
              }
            />
            <Route
              path="petugas-jumat"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <FridaySchedulesPage />
                </RoleRoute>
              }
            />
            <Route
              path="petugas-jumat/cetak"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <FridayPrintPage />
                </RoleRoute>
              }
            />
            <Route
              path="import-jamaah"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN"]}>
                  <MemberImportPage />
                </RoleRoute>
              }
            />
            <Route
              path="rekap-absensi"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <MemberAttendanceRecapPage />
                </RoleRoute>
              }
            />
            <Route
              path="rekap-absensi/cetak"
              element={
                <RoleRoute allowed={["SUPER_ADMIN", "ADMIN", "TIM_ABSENSI", "PENGAWAS"]}>
                  <RecapPrintPage />
                </RoleRoute>
              }
            />
          </Route>

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
