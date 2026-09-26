import { useState } from "react";
import { BottomSheet, Button, Input } from "./index";
import { userApi } from "../../services/domainApi";
import { ApiError } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function ChangeUsernameSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const { user, logout } = useAuth();

  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const currentUsername = user?.username || "";

  function reset() {
    setNewUsername("");
    setPassword("");
    setSaving(false);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  const trimmedUsername = newUsername.trim().toLowerCase();
  const formatOk = USERNAME_REGEX.test(trimmedUsername);
  const sameAsCurrent = trimmedUsername === currentUsername;
  const passwordOk = password.length > 0;

  const canSubmit =
    !saving &&
    trimmedUsername.length > 0 &&
    formatOk &&
    !sameAsCurrent &&
    passwordOk;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const res = await userApi.changeUsername({
        password,
        new_username: trimmedUsername,
      });
      showToast(
        "Username berhasil diganti ke @" +
          res.username +
          ". Silakan login ulang.",
      );
      reset();
      onClose();
      setTimeout(() => {
        logout();
      }, 1200);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal ganti username",
        "error",
      );
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Ganti Username">
      <div className="rounded-xl bg-warning-soft border border-warning/20 p-3 mb-4">
        <p className="text-ios-footnote text-warning leading-relaxed">
          Setelah ganti username, Anda akan <strong>logout otomatis</strong>.
          Login ulang menggunakan username baru.
        </p>
      </div>

      <div className="rounded-xl bg-accent-soft/60 border border-accent/15 p-3 mb-4">
        <p className="text-ios-caption text-accent/80">
          Username saat ini:{" "}
          <span className="font-mono font-semibold text-accent">
            @{currentUsername}
          </span>
        </p>
      </div>

      <Input
        label="Username Baru"
        type="text"
        value={newUsername}
        onChange={(e) =>
          setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
        }
        placeholder="Contoh: ahmad_01"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        hint="3-20 karakter: huruf kecil, angka, underscore"
      />

      {newUsername && !formatOk && (
        <p className="-mt-2 mb-3 text-ios-caption text-danger px-1">
          Format username tidak valid
        </p>
      )}
      {newUsername && formatOk && sameAsCurrent && (
        <p className="-mt-2 mb-3 text-ios-caption text-danger px-1">
          Username baru sama dengan username lama
        </p>
      )}

      <Input
        label="Password Konfirmasi"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Masukkan password saat ini"
        hint="Untuk konfirmasi keamanan"
        autoComplete="current-password"
      />

      <Button fullWidth onClick={handleSubmit} disabled={!canSubmit}>
        {saving ? "Menyimpan..." : "Simpan Username"}
      </Button>
    </BottomSheet>
  );
}
