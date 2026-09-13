import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Check,
  X,
  Thermometer,
  CircleAlert,
  ChevronDown,
  Calendar,
  Trash2,
} from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Button,
  EmptyState,
  BottomSheet,
  Select,
  Input,
  LoadingOverlay,
  ConfirmDialog,
} from "../components/common";
import { meetingApi, attendanceApi, groupApi } from "../services/domainApi";
import { memberApi } from "../services/memberApi";
import type {
  Meeting,
  Member,
  AttendanceStatus,
  Group,
  MemberCategory,
} from "../types";
import {
  formatDateLong,
  formatDateShort,
  getHariFromDate,
  getTodayIso,
} from "../utils/format";
import { ATTENDANCE_STATUSES, MEMBER_CATEGORIES } from "../constants";
import { CATEGORY_LABEL } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import {
  AttendanceListSkeleton,
  AttendancePageSkeleton,
} from "../components/common/Skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { DateInput } from "../components/common/DateInput";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    Icon: typeof Check;
    activeClass: string;
    inactiveClass: string;
  }
> = {
  HADIR: {
    label: "Hadir",
    Icon: Check,
    activeClass: "bg-accent text-white shadow-sm shadow-accent/30",
    inactiveClass:
      "bg-surface-card2 text-surface-muted hover:bg-accent-soft hover:text-accent",
  },
  IJIN: {
    label: "Ijin",
    Icon: X,
    activeClass: "bg-warning text-white shadow-sm shadow-warning/30",
    inactiveClass:
      "bg-surface-card2 text-surface-muted hover:bg-warning-soft hover:text-warning",
  },
  SAKIT: {
    label: "Sakit",
    Icon: Thermometer,
    activeClass: "bg-info text-white shadow-sm shadow-info/30",
    inactiveClass:
      "bg-surface-card2 text-surface-muted hover:bg-info-soft hover:text-info",
  },
  TANPA_KETERANGAN: {
    label: "Alpa",
    Icon: CircleAlert,
    activeClass: "bg-danger text-white shadow-sm shadow-danger/30",
    inactiveClass:
      "bg-surface-card2 text-surface-muted hover:bg-danger-soft hover:text-danger",
  },
};

export default function AttendancePage() {
  const { isAdminLike, role } = usePermission();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [pinnedMeetingId, setPinnedMeetingId] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<
    Record<string, AttendanceStatus | undefined>
  >({});

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [meetingPickerOpen, setMeetingPickerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const {
    data: meetings = [],
    isLoading: loadingMeetings,
    error: meetingsError,
  } = useQuery({
    queryKey: queryKeys.meetings({ range: "recent" }),
    queryFn: () => {
      const from = new Date(Date.now() - 14 * 86400000)
        .toISOString()
        .slice(0, 10);
      return meetingApi.list({ from });
    },
    staleTime: 2 * 60_000,
  });

  const selectedMeeting = useMemo(() => {
    if (meetings.length === 0) return null;
    if (pinnedMeetingId) {
      return meetings.find((m) => m.meeting_id === pinnedMeetingId) || null;
    }
    const today = new Date().toISOString().slice(0, 10);
    return meetings.find((m) => m.tanggal === today) || meetings[0] || null;
  }, [meetings, pinnedMeetingId]);

  useEffect(() => {
    setOptimistic({});
  }, [selectedMeeting?.meeting_id]);

  const memberQuery = useQuery({
    queryKey: ["attendance-members"],
    queryFn: () => memberApi.listForAttendance({}),
    enabled: !!selectedMeeting,
    staleTime: 5 * 60_000,
  });

  const members = memberQuery.data ?? [];
  const loadingMembers = memberQuery.isLoading;
  const membersError = memberQuery.error;

  const eligibleMembers = useMemo(() => {
    const targets = normalizeTargets(selectedMeeting?.kategori_target);
    if (targets.length === 0) return members;
    return members.filter((m) => m.kategori && targets.includes(m.kategori));
  }, [members, selectedMeeting?.kategori_target]);

  const attendanceQuery = useQuery({
    queryKey: queryKeys.attendance(selectedMeeting?.meeting_id || ""),
    queryFn: () => attendanceApi.byMeeting(selectedMeeting!.meeting_id),
    enabled: !!selectedMeeting,
    staleTime: 30_000,
  });

  const attendanceRows = attendanceQuery.data ?? [];
  const loadingAttendance = attendanceQuery.isLoading;
  const attendanceError = attendanceQuery.error;

  const records = useMemo(() => {
    const base: Record<string, AttendanceStatus> = {};
    attendanceRows.forEach((a) => {
      base[a.member_id] = a.status;
    });
    Object.entries(optimistic).forEach(([memberId, status]) => {
      if (status === undefined) delete base[memberId];
      else base[memberId] = status;
    });
    return base;
  }, [attendanceRows, optimistic]);

  const filteredMembers = useMemo(() => {
    return eligibleMembers.filter((m) => {
      if (category && m.kategori !== category) return false;
      if (
        search &&
        !m.nama_lengkap.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [eligibleMembers, category, search]);

  const hadirCount = useMemo(
    () => Object.values(records).filter((s) => s === "HADIR").length,
    [records],
  );

  const totalRecords = useMemo(() => Object.keys(records).length, [records]);

  const progress = filteredMembers.length
    ? (hadirCount / filteredMembers.length) * 100
    : 0;

  const saveMutation = useMutation({
    mutationFn: attendanceApi.save,
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan absensi",
        "error",
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: attendanceApi.remove,
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus absensi",
        "error",
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: (meetingId: string) => attendanceApi.removeByMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance(selectedMeeting?.meeting_id || ""),
      });
      showToast("Semua absensi dihapus");
      setConfirmResetAll(false);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus semua absensi",
        "error",
      );
      setConfirmResetAll(false);
    },
  });

  async function tapStatus(memberId: string, status: AttendanceStatus) {
    if (!selectedMeeting) return;
    const prev = records[memberId];
    const nextStatus = prev === status ? undefined : status;

    setOptimistic((o) => ({ ...o, [memberId]: nextStatus }));

    try {
      if (nextStatus) {
        await saveMutation.mutateAsync({
          meeting_id: selectedMeeting.meeting_id,
          member_id: memberId,
          status: nextStatus,
        });
      } else {
        await removeMutation.mutateAsync({
          meeting_id: selectedMeeting.meeting_id,
          member_id: memberId,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance(selectedMeeting.meeting_id),
      });
    } catch {
      setOptimistic((o) => {
        const next = { ...o };
        delete next[memberId];
        return next;
      });
    }
  }

  async function deleteAttendance(memberId: string) {
    if (!selectedMeeting) return;
    const prev = records[memberId];
    if (!prev) return;

    setOptimistic((o) => ({ ...o, [memberId]: undefined }));

    try {
      await removeMutation.mutateAsync({
        meeting_id: selectedMeeting.meeting_id,
        member_id: memberId,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance(selectedMeeting.meeting_id),
      });
      showToast("Absensi dihapus");
    } catch {
      setOptimistic((o) => {
        const next = { ...o };
        delete next[memberId];
        return next;
      });
    }
  }

  async function markAllPresent() {
    if (!selectedMeeting) return;
    const targets = filteredMembers.filter(
      (m) => records[m.member_id] !== "HADIR",
    );
    if (!targets.length) return;

    const optimisticPatch: Record<string, AttendanceStatus | undefined> = {};
    targets.forEach((m) => {
      optimisticPatch[m.member_id] = "HADIR";
    });
    setOptimistic((o) => ({ ...o, ...optimisticPatch }));

    try {
      await Promise.all(
        targets.map((m) =>
          attendanceApi.save({
            meeting_id: selectedMeeting.meeting_id,
            member_id: m.member_id,
            status: "HADIR",
          }),
        ),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance(selectedMeeting.meeting_id),
      });
      showToast(`${targets.length} jamaah ditandai hadir`);
    } catch (err) {
      setOptimistic((o) => {
        const next = { ...o };
        targets.forEach((m) => delete next[m.member_id]);
        return next;
      });
      showToast(
        err instanceof ApiError ? err.message : "Gagal menandai semua hadir",
        "error",
      );
    }
  }

  function resetAllAttendance() {
    if (!selectedMeeting) return;
    setOptimistic({});
    resetMutation.mutate(selectedMeeting.meeting_id);
  }

  const canCreate = isAdminLike || role === "TIM_ABSENSI";

  const attendanceReady =
    !selectedMeeting || attendanceQuery.data !== undefined;

  const membersReady = !selectedMeeting || memberQuery.data !== undefined;

  const isInitialLoading =
    loadingMeetings ||
    (!!selectedMeeting && (!attendanceReady || !membersReady));

  return (
    <AppLayout
      fab={
        canCreate ? (
          <FloatingActionButton onClick={() => setCreateOpen(true)} />
        ) : undefined
      }
    >
      <Header
        title="Absensi"
        subtitle={
          selectedMeeting ? formatDateLong(selectedMeeting.tanggal) : undefined
        }
      />

      {isInitialLoading ? (
        <AttendancePageSkeleton rows={8} />
      ) : (
        <>
          <div className="pt-3 pb-2">
            {meetings.length > 0 ? (
              <div className="px-4">
                <button
                  onClick={() => setMeetingPickerOpen(true)}
                  className="w-full min-h-[52px] rounded-2xl border border-surface-border bg-surface-card px-4 py-2.5 flex items-center gap-3 text-left transition-all hover:border-accent/40 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-surface-muted uppercase tracking-wide">
                      Jadwal dipilih
                    </p>
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {selectedMeeting
                        ? `${selectedMeeting.hari} — ${selectedMeeting.acara || "Pengajian"}`
                        : "Pilih jadwal"}
                    </p>
                    {selectedMeeting && (
                      <p className="text-ios-footnote text-surface-muted truncate">
                        {formatDateShort(selectedMeeting.tanggal)} ·{" "}
                        {selectedMeeting.jam || "—"}
                      </p>
                    )}
                    {selectedMeeting &&
                      normalizeTargets(selectedMeeting.kategori_target).length >
                        0 && (
                        <p className="text-ios-caption text-accent truncate mt-0.5">
                          {normalizeTargets(selectedMeeting.kategori_target)
                            .map((k) => CATEGORY_LABEL[k])
                            .join(" · ")}
                        </p>
                      )}
                  </div>
                  <ChevronDown
                    size={18}
                    className="text-surface-muted flex-shrink-0"
                  />
                </button>
              </div>
            ) : (
              <div className="px-4 rounded-2xl border border-dashed border-surface-border bg-surface-card p-4 text-center">
                <p className="text-ios-subhead text-surface-muted">
                  Belum ada jadwal pengajian
                </p>
                {canCreate && (
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="mt-2 inline-flex items-center gap-1 text-ios-subhead font-medium text-accent transition-colors hover:text-accent-dark"
                  >
                    <Plus size={14} /> Buat jadwal pengajian
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedMeeting && (
            <>
              <div
                className="sticky z-20 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border"
                style={{ top: "calc(52px + var(--safe-top))" }}
              >
                <div className="px-4 pt-2 pb-2">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari jamaah"
                      className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-3.5 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    />
                  </div>
                </div>

                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                  <CategoryChip
                    active={category === ""}
                    label="Semua"
                    onClick={() => setCategory("")}
                  />
                  {MEMBER_CATEGORIES.map((c) => (
                    <CategoryChip
                      key={c}
                      active={category === c}
                      label={CATEGORY_LABEL[c]}
                      onClick={() => setCategory(c)}
                    />
                  ))}
                </div>

                <div className="px-4 py-2 flex items-center justify-between gap-2 border-t border-surface-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-ios-footnote text-surface-muted tabular-nums">
                      <span className="font-semibold text-surface-text">
                        {hadirCount}
                      </span>
                      /{filteredMembers.length} hadir
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-surface-card2 overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {totalRecords > 0 && (
                      <button
                        onClick={() => setConfirmResetAll(true)}
                        disabled={loadingAttendance || resetMutation.isPending}
                        aria-label="Reset semua absensi"
                        title="Reset semua absensi"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger transition-colors hover:bg-danger-soft active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <button
                      onClick={markAllPresent}
                      disabled={
                        loadingAttendance ||
                        hadirCount === filteredMembers.length
                      }
                      className="text-ios-footnote font-medium bg-accent-soft text-accent px-3 h-8 rounded-lg transition-colors hover:opacity-80 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Hadir semua
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card">
                {filteredMembers.length === 0 && (
                  <EmptyState
                    title="Tidak ada jamaah"
                    description={
                      search || category
                        ? "Coba ubah kata kunci atau filter kategori."
                        : normalizeTargets(selectedMeeting?.kategori_target)
                              .length > 0
                          ? `Tidak ada jamaah dengan kategori ${normalizeTargets(
                              selectedMeeting?.kategori_target,
                            )
                              .map((k) => CATEGORY_LABEL[k])
                              .join(", ")}.`
                          : "Belum ada jamaah yang terdaftar di kelompok ini."
                    }
                  />
                )}

                {filteredMembers.map((m, i) => (
                  <CompactAttendanceRow
                    key={m.member_id}
                    member={m}
                    status={records[m.member_id]}
                    onStatus={(s) => tapStatus(m.member_id, s)}
                    onRequestDelete={() =>
                      setDeleteTarget({
                        memberId: m.member_id,
                        memberName: m.nama_lengkap,
                      })
                    }
                    divider={i !== filteredMembers.length - 1}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <MeetingPickerSheet
        open={meetingPickerOpen}
        meetings={meetings}
        selectedId={selectedMeeting?.meeting_id}
        onSelect={(m) => {
          setPinnedMeetingId(m.meeting_id);
          setMeetingPickerOpen(false);
        }}
        onClose={() => setMeetingPickerOpen(false)}
        onCreateNew={() => {
          setMeetingPickerOpen(false);
          setCreateOpen(true);
        }}
        canCreate={canCreate}
      />

      <CreateMeetingSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(m) => {
          queryClient.setQueryData(
            queryKeys.meetings({ range: "recent" }),
            (old: Meeting[] = []) => {
              const exists = old.some((x) => x.meeting_id === m.meeting_id);
              if (exists) return old;
              return [m, ...old];
            },
          );
          setPinnedMeetingId(m.meeting_id);
          queryClient.invalidateQueries({
            queryKey: queryKeys.meetings({ range: "recent" }),
          });
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus absensi?"
        description={
          deleteTarget
            ? `Hapus catatan absensi ${deleteTarget.memberName}?`
            : ""
        }
        confirmLabel="Hapus"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAttendance(deleteTarget.memberId);
            setDeleteTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={confirmResetAll}
        title="Reset semua absensi?"
        description={`Semua catatan absensi untuk ${
          selectedMeeting?.acara || "pengajian ini"
        } akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Reset"
        danger
        onCancel={() => setConfirmResetAll(false)}
        onConfirm={resetAllAttendance}
      />

      <LoadingOverlay
        open={resetMutation.isPending}
        label="Menghapus absensi..."
      />
    </AppLayout>
  );
}

function CompactAttendanceRow({
  member,
  status,
  onStatus,
  onRequestDelete,
  divider,
}: {
  member: Member;
  status?: AttendanceStatus;
  onStatus: (s: AttendanceStatus) => void;
  onRequestDelete: () => void;
  divider?: boolean;
}) {
  const longPressTimer = useRef<number | null>(null);
  const didLongPress = useRef(false);

  function startLongPress() {
    if (!status) return;
    didLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      didLongPress.current = true;
      onRequestDelete();
    }, 600);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    if (status) {
      e.preventDefault();
      onRequestDelete();
    }
  }

  return (
    <div
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onTouchCancel={cancelLongPress}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onContextMenu={handleContextMenu}
      className={`flex items-center gap-2 px-4 min-h-[56px] transition-colors hover:bg-surface-card2/40 select-none ${
        divider ? "border-b border-surface-border" : ""
      }`}
    >
      <div className="flex-1 min-w-0 py-2">
        <p className="text-ios-body font-medium text-surface-text truncate">
          {member.nama_lengkap}
        </p>
        {member.kelompok && (
          <p className="text-ios-caption text-surface-muted truncate">
            {member.kelompok}
          </p>
        )}
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {ATTENDANCE_STATUSES.map((s) => {
          const config = STATUS_CONFIG[s];
          const Icon = config.Icon;
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => onStatus(s)}
              aria-label={config.label}
              title={config.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.9] ${
                active ? config.activeClass : config.inactiveClass
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.6 : 2.2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function normalizeTargets(raw: unknown): MemberCategory[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as MemberCategory[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as MemberCategory[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function MeetingPickerSheet({
  open,
  meetings,
  selectedId,
  onSelect,
  onClose,
  onCreateNew,
  canCreate,
}: {
  open: boolean;
  meetings: Meeting[];
  selectedId?: string;
  onSelect: (m: Meeting) => void;
  onClose: () => void;
  onCreateNew: () => void;
  canCreate: boolean;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Pilih Jadwal Pengajian">
      <div className="space-y-2">
        {meetings.map((m) => {
          const active = m.meeting_id === selectedId;
          const targets = normalizeTargets(m.kategori_target);
          return (
            <button
              key={m.meeting_id}
              onClick={() => onSelect(m)}
              className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-all active:scale-[0.99] ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-surface-border bg-surface-card hover:bg-surface-card2"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  active
                    ? "bg-accent text-white"
                    : "bg-surface-card2 text-surface-muted"
                }`}
              >
                <Calendar size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-body font-medium text-surface-text truncate">
                  {m.hari} — {m.acara || "Pengajian"}
                </p>
                <p className="text-ios-footnote text-surface-muted truncate">
                  {formatDateShort(m.tanggal)} · {m.jam || "—"}
                </p>
                {targets.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {targets.map((k) => (
                      <span
                        key={k}
                        className="text-[10px] font-semibold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 uppercase"
                      >
                        {CATEGORY_LABEL[k]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {active && (
                <Check size={18} className="text-accent flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {canCreate && (
        <button
          onClick={onCreateNew}
          className="mt-3 w-full min-h-[48px] rounded-2xl border-2 border-dashed border-surface-border text-ios-subhead font-medium text-accent flex items-center justify-center gap-1.5 transition-colors hover:bg-accent-soft/50 active:scale-[0.99]"
        >
          <Plus size={16} /> Buat jadwal baru
        </button>
      )}
    </BottomSheet>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] ${
        active
          ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
          : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
      }`}
    >
      {label}
    </button>
  );
}

function CreateMeetingSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (m: Meeting) => void;
}) {
  const { showToast } = useToast();
  const [tanggal, setTanggal] = useState(getTodayIso());
  const [jam, setJam] = useState("Isya di tempat");
  const [groupId, setGroupId] = useState("");
  const [acara, setAcara] = useState("Sambung Kelompok");
  const [kategoriTarget, setKategoriTarget] = useState<MemberCategory[]>([]);

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    setTanggal(getTodayIso());
    setJam("Isya di tempat");
    setGroupId("");
    setAcara("Sambung Kelompok");
    setKategoriTarget([]);
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      meetingApi.create({
        tanggal,
        jam,
        group_id: groupId,
        acara,
        kategori_target: kategoriTarget,
      }),
    onSuccess: (meeting) => {
      showToast("Jadwal pengajian dibuat");
      onCreated(meeting);
      onClose();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat jadwal",
        "error",
      );
    },
  });

  function toggleKategori(c: MemberCategory) {
    setKategoriTarget((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Jadwal Pengajian Baru">
      <DateInput
        label="Tanggal"
        value={tanggal}
        onChange={setTanggal}
        hint={`Hari: ${getHariFromDate(tanggal)}`}
      />
      <Select
        label="Kelompok"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      >
        <option value="">Pilih kelompok</option>
        {groups.map((g) => (
          <option key={g.group_id} value={g.group_id}>
            {g.group_name}
          </option>
        ))}
      </Select>
      <Input label="Jam" value={jam} onChange={(e) => setJam(e.target.value)} />
      <Input
        label="Acara"
        value={acara}
        onChange={(e) => setAcara(e.target.value)}
      />

      <div className="mb-4">
        <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
          Kategori Jamaah yang Diabsen
        </label>
        <p className="text-ios-caption text-surface-muted mb-3 px-1">
          Kosongkan untuk semua kategori
        </p>
        <div className="flex flex-wrap gap-2">
          {MEMBER_CATEGORIES.map((c) => {
            const active = kategoriTarget.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleKategori(c)}
                className={`px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] ${
                  active
                    ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
                    : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
                }`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        fullWidth
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Menyimpan..." : "Buat Jadwal"}
      </Button>
    </BottomSheet>
  );
}
