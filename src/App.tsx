import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MemberRoute } from "./components/layout/MemberRoute";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MembersListPage from "./pages/MembersListPage";
import MemberDetailPage from "./pages/MemberDetailPage";
import MemberFormPage from "./pages/MemberFormPage";
import AttendancePage from "./pages/AttendancePage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import OthersPage from "./pages/OthersPage";
import GroupsPage from "./pages/GroupsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import AuditLogPage from "./pages/AuditLogPage";
import AiChatPage from "./pages/AiChatPage";

import MemberSelfPage from "./pages/MemberSelfPage";
import MemberEditProfilePage from "./pages/MemberEditProfilePage";

import PendingMembersPage from "./pages/PendingMembersPage";
import PendingMemberDetailPage from "./pages/PendingMemberDetailPage";

import PublicRegistrationPage from "./pages/PublicRegistrationPage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";
import MemberAiChatPage from "./pages/MemberAiChatPage";
import AiUsagePage from "./pages/AiUsagePage";
import QrCodePage from "./pages/QrCodePage";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route path="/daftar" element={<PublicRegistrationPage />} />
              <Route
                path="/daftar/sukses"
                element={<RegistrationSuccessPage />}
              />

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
                </Route>

                <Route path="/ai-chat" element={<AiChatPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
