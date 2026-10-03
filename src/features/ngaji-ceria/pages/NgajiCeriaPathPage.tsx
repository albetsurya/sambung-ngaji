import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import {
  Lock,
  Play,
  CheckCircle2,
  ChevronRight,
} from "../../../components/ui/FontAwesomeIcons";

interface JilidCardProps {
  jilid: (typeof TILAWATI_DATA)[0];
  status: "locked" | "active" | "completed";
  currentLesson?: number;
  progressPercentage?: number;
  onClick: () => void;
}

function JilidCard({
  jilid,
  status,
  currentLesson,
  progressPercentage,
  onClick,
}: JilidCardProps) {
  const bgColorClass = useMemo(() => {
    switch (status) {
      case "completed":
        return "bg-success-soft text-success border-success/30";
      case "active":
        return "bg-accent-soft text-accent border-accent/30";
      case "locked":
      default:
        return "bg-surface-card2 text-surface-muted border-surface-border";
    }
  }, [status]);

  const icon = useMemo(() => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={24} className="text-success" />;
      case "active":
        return <Play size={24} className="text-accent" />;
      case "locked":
      default:
        return <Lock size={24} className="text-surface-muted" />;
    }
  }, [status]);

  return (
    <button
      onClick={onClick}
      disabled={status === "locked"}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98] shadow-sm flex flex-col items-start gap-3 border-2 ${
        bgColorClass
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
          status === "active" ? "animate-pulse bg-accent-light/30" : ""
        }`}
      >
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center ${
            status === "completed"
              ? "bg-success"
              : status === "active"
              ? "bg-accent"
              : "bg-surface-card"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-surface-text">{jilid.nama}</h3>
        <p className="text-xs text-surface-muted mt-0.5 leading-tight">
          {jilid.deskripsi}
        </p>
        {status === "active" && currentLesson && (
          <p className="text-[11px] font-semibold text-accent mt-2">
            Halaman {currentLesson}
            {progressPercentage !== undefined && ` (${progressPercentage}%)`}
          </p>
        )}
        {status === "completed" && (
          <p className="text-[11px] font-semibold text-success mt-2">
            Selesai!
          </p>
        )}
      </div>
      {status !== "locked" && (
        <ChevronRight size={18} className="text-surface-muted ml-auto" />
      )}
    </button>
  );
}

export default function NgajiCeriaPathPage() {
  const navigate = useNavigate();
  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);

  return (
    <NgajiCeriaLayout title="Peta Jelajah" showBack>
      <div className="px-4 py-4 space-y-4">
        {TILAWATI_DATA.map((jilid, index) => {
          let status: JilidCardProps["status"] = "locked";
          let lessonNum: number | undefined;
          let progPercent: number | undefined;

          if (jilid.id === currentJilid) {
            status = "active";
            lessonNum = currentPage;
            progPercent = progressPercentage;
          } else if (
            TILAWATI_DATA.findIndex((j) => j.id === jilid.id) <
            TILAWATI_DATA.findIndex((j) => j.id === currentJilid)
          ) {
            status = "completed";
          }

          return (
            <JilidCard
              key={jilid.id}
              jilid={jilid}
              status={status}
              currentLesson={lessonNum}
              progressPercentage={progPercent}
              onClick={() =>
                status === "active" &&
                navigate(
                  `/member/ngaji-ceria/belajar?jilid=${jilid.id}&page=${lessonNum}`,
                )
              }
            />
          );
        })}
      </div>
    </NgajiCeriaLayout>
  );
}
