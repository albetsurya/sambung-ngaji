import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MemberRoute } from "./components/layout/MemberRoute";
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
const BulkMeetingPage = lazy(() => import("./pages/BulkMeetingPage"));
const AnnouncementTemplatesPage = lazy(
  () => import("./pages/AnnouncementTemplatesPage"),
);

const MemberSelfPage = lazy(() => import("./pages/MemberSelfPage"));
const MemberEditProfilePage = lazy(
  () => import("./pages/MemberEditProfilePage"),
);

const PendingMembersPage = lazy(() => import("./pages/PendingMembersPage"));
const PendingMemberDetailPage = lazy(
  () => import("./pages/PendingMemberDetailPage"),
);

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
            <MemberRoute>
              <MemberSelfPage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/edit"
          element={
            <MemberRoute>
              <MemberEditProfilePage />
            </MemberRoute>
          }
        />
        <Route
          path="/member/ai"
          element={
            <MemberRoute>
              <MemberAiChatPage />
            </MemberRoute>
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
            <Route path="qr-code" element={<QrCodePage />} />
            <Route path="ai-usage" element={<AiUsagePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="pengaturan" element={<SettingsPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="bulk-meeting" element={<BulkMeetingPage />} />
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
