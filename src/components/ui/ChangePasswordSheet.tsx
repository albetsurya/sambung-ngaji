import { useState } from "react";
import { BottomSheet, Button, Input } from "./index";
import { userApi } from "../../services/domainApi";
import { ApiError } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

export function ChangePasswordSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaving(false);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!oldPassword) {
      showToast("Password lama wajib diisi", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi password tidak cocok", "error");
      return;
    }
    if (newPassword === oldPassword) {
      showToast("Password baru harus berbeda dari password lama", "error");
      return;
    }

    setSaving(true);
    try {
      await userApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      showToast("Password berhasil diubah");
      reset();
      onClose();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal mengubah password",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Ganti Password">
      <Input
        label="Password Lama"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        placeholder="Masukkan password saat ini"
        autoComplete="current-password"
      />
      <Input
        label="Password Baru"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Minimal 6 karakter"
        hint="Minimal 6 karakter"
        autoComplete="new-password"
      />
      <Input
        label="Konfirmasi Password Baru"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Ulangi password baru"
        autoComplete="new-password"
      />
      <Button
        fullWidth
        onClick={handleSubmit}
        disabled={saving || !oldPassword || !newPassword || !confirmPassword}
      >
        {saving ? "Menyimpan..." : "Simpan Password"}
      </Button>
    </BottomSheet>
  );
}

export function ResetPasswordSheet({
  open,
  onClose,
  userId,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string;
}) {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setNewPassword("");
    setConfirmPassword("");
    setSaving(false);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!userId) return;
    if (newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi password tidak cocok", "error");
      return;
    }

    setSaving(true);
    try {
      await userApi.resetPassword({
        user_id: userId,
        new_password: newPassword,
      });
      showToast(`Password ${userName} berhasil direset`);
      reset();
      onClose();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal reset password",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={`Reset Password: ${userName}`}
    >
      <div className="rounded-xl bg-warning-soft border border-warning/20 p-3 mb-4">
        <p className="text-ios-footnote text-warning leading-relaxed">
          Password lama akan diganti. Beritahu user password baru setelah reset.
        </p>
      </div>

      <Input
        label="Password Baru"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Minimal 6 karakter"
        hint="Minimal 6 karakter"
        autoComplete="new-password"
      />
      <Input
        label="Konfirmasi Password Baru"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Ulangi password baru"
        autoComplete="new-password"
      />
      <Button
        fullWidth
        onClick={handleSubmit}
        disabled={saving || !newPassword || !confirmPassword}
      >
        {saving ? "Menyimpan..." : "Reset Password"}
      </Button>
    </BottomSheet>
  );
}
