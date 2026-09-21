import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { PersonalRoute } from "./components/layout/PersonalRoute";
import { useBackgroundSync } from "./hooks/useBackgroundSync";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MembersListPage = lazy(() => import("./pages/MembersListPage"));
const MemberDetailPage = lazy(() => import("./pages/MemberDetailPage"));
const MemberFormPage = lazy(() => import("./pages/MemberFormPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const OthersPage = lazy(() => import("./pages/OthersPage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
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
const AiUsagePage = lazy(() => import("./pages/AiUsagePage"));
const QrCodePage = lazy(() => import("./pages/QrCodePage"));

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

function AppRoutes() {
  useBackgroundSync();

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/daftar" element={<PublicRegistrationPage />} />
        <Route path="/daftar/sukses" element={<RegistrationSuccessPage />} />

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
            <PersonalRoute>
              <MemberPrayerPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/doa"
          element={
            <PersonalRoute>
              <MemberDoaPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/kiblat"
          element={
            <PersonalRoute>
              <MemberKiblatPage />
            </PersonalRoute>
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
            <PersonalRoute>
              <MemberSchedulePage />
            </PersonalRoute>
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
            <PersonalRoute>
              <MemberPuasaPage />
            </PersonalRoute>
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
            <PersonalRoute>
              <MemberMoodPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/quran"
          element={
            <PersonalRoute>
              <MemberQuranPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/quran/mushaf"
          element={
            <PersonalRoute>
              <MemberQuranMushafPage />
            </PersonalRoute>
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
            <PersonalRoute>
              <MemberQuranSurahPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/dzikir"
          element={
            <PersonalRoute>
              <MemberDzikirPage />
            </PersonalRoute>
          }
        />
        <Route
          path="/member/dzikir/:id"
          element={
            <PersonalRoute>
              <MemberDzikirCounterPage />
            </PersonalRoute>
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
            <PersonalRoute>
              <MemberGuidePage />
            </PersonalRoute>
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

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jamaah" element={<MembersListPage />} />
          <Route path="/jamaah/baru" element={<MemberFormPage />} />
          <Route path="/jamaah/:id" element={<MemberDetailPage />} />
          <Route path="/jamaah/:id/edit" element={<MemberFormPage />} />
          <Route path="/absensi" element={<AttendancePage />} />
          <Route path="/pengumuman" element={<AnnouncementsPage />} />
          <Route
            path="/pengumuman/templates"
            element={<AnnouncementTemplatesPage />}
          />
          <Route path="/profil-saya" element={<MemberSelfPage />} />
          <Route path="/profil-saya/edit" element={<MemberEditProfilePage />} />

          <Route path="/lainnya">
            <Route index element={<OthersPage />} />
            <Route path="kelompok" element={<GroupsPage />} />
            <Route path="pendaftar" element={<PendingMembersPage />} />
            <Route
              path="pendaftar/:submission_id"
              element={<PendingMemberDetailPage />}
            />
            <Route
              path="permintaan-member"
              element={<MemberRequestsPage />}
            />
            <Route path="qr-code" element={<QrCodePage />} />
            <Route path="ai-usage" element={<AiUsagePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="pengaturan" element={<SettingsPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="jadwal" element={<JadwalPage />} />
            <Route path="import-jamaah" element={<MemberImportPage />} />
          </Route>

          <Route path="/ai-chat" element={<AiChatPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
