import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

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

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/jamaah"
                element={
                  <ProtectedRoute>
                    <MembersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jamaah/baru"
                element={
                  <ProtectedRoute>
                    <MemberFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jamaah/:id"
                element={
                  <ProtectedRoute>
                    <MemberDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jamaah/:id/edit"
                element={
                  <ProtectedRoute>
                    <MemberFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/absensi"
                element={
                  <ProtectedRoute>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pengumuman"
                element={
                  <ProtectedRoute>
                    <AnnouncementsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/lainnya"
                element={
                  <ProtectedRoute>
                    <OthersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lainnya/kelompok"
                element={
                  <ProtectedRoute>
                    <GroupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lainnya/users"
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lainnya/pengaturan"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lainnya/audit-log"
                element={
                  <ProtectedRoute>
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai-chat"
                element={
                  <ProtectedRoute>
                    <AiChatPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
