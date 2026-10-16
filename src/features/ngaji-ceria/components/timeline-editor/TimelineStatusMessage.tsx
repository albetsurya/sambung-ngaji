import React from "react";

interface Props {
  error: string;
  message: string;
}

export const TimelineStatusMessage: React.FC<Props> = ({ error, message }) => (
  <div className="te-status" aria-live="polite">
    {error || message || "Semua aksi edit adalah draft client. File hanya berubah saat Simpan Hasil Akhir."}
  </div>
);
