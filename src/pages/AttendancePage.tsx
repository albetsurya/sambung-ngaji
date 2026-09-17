import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
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
  MoreVertical,
  Pencil,
  AlertTriangle,
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
  ConfirmDialog,
} from "../components/common";
import { meetingApi, attendanceApi, groupApi } from "../services/domainApi";
import type {
  Meeting,
  Member,
  AttendanceStatus,
  AttendanceRecord,
  MemberCategory,
} from "../types";
import {
  formatDateLong,
  formatDateLongText,
  getHariFromDate,
  getTodayIso,
} from "../utils/format";
import { ATTENDANCE_STATUSES, MEMBER_CATEGORIES } from "../constants";
import { CATEGORY_LABEL } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { AttendancePageSkeleton } from "../components/common/Skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { DateInput } from "../components/common/DateInput";

/* -------------------------------------------------------------------------- */
/*                              Types & State                                 */
/* -------------------------------------------------------------------------- */

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

interface AttendancePageData {
  meeting: Meeting;
  members: Member[];
  attendance: AttendanceRecord[];
}

type SheetState =
  | { view: "closed" }
  | { view: "picker" }
  | { view: "action"; meeting: Meeting }
  | { view: "form"; mode: "create"; from: "picker" | "fab" }
  | { view: "form"; mode: "edit"; meeting: Meeting };

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function AttendancePage() {
  const navigate = useNavigate();
  const { isAdminLike, role } = usePermission();
  const isReadonly = role === "PENGAWAS";
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [pinnedMeetingId, setPinnedMeetingId] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<
    Record<string, AttendanceStatus | undefined>
  >({});

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState<"" | "L" | "P">("");

  const [sheet, setSheet] = useState<SheetState>({ view: "closed" });

  const [deleteMeetingTarget, setDeleteMeetingTarget] =
    useState<Meeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  /* -------------------------------- Data --------------------------------- */

  const meetingsQuery = useQuery({
    queryKey: queryKeys.meetings({ range: "recent" }),
    queryFn: () => {
      const from = new Date(Date.now() - 14 * 86400000)
        .toISOString()
        .slice(0, 10);
      return meetingApi.list({ from });
    },
    staleTime: 2 * 60_000,
  });

  const meetings = meetingsQuery.data ?? [];
  const loadingMeetings = meetingsQuery.isLoading;

  const selectedMeeting = useMemo(() => {
    if (meetings.length === 0) return null;
    if (pinnedMeetingId) {
      return meetings.find((m) => m.meeting_id === pinnedMeetingId) || null;
    }
    const today = new Date().toISOString().slice(0, 10);
    return meetings.find((m) => m.tanggal === today) || meetings[0] || null;
  }, [meetings, pinnedMeetingId]);

  const selectedMeetingId = selectedMeeting?.meeting_id || "";

  useEffect(() => {
    setOptimistic({});
    setGender("");
    setCategory("");
  }, [selectedMeetingId]);

  const pageQuery = useQuery<AttendancePageData>({
    queryKey: queryKeys.attendancePage(selectedMeetingId),
    queryFn: () =>
      attendanceApi.getPage(selectedMeetingId) as Promise<AttendancePageData>,
    enabled: !!selectedMeetingId,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });

  const pageData = pageQuery.data;
  const members = pageData?.members ?? [];
  const attendanceRows = pageData?.attendance ?? [];
  const loadingAttendance = pageQuery.isLoading;
  const attendanceReady = !selectedMeetingId || pageData !== undefined;

  const eligibleMembers = useMemo(() => {
    const targets = normalizeTargets(selectedMeeting?.kategori_target);
    if (targets.length === 0) return members;
    return members.filter((m) => m.kategori && targets.includes(m.kategori));
  }, [members, selectedMeeting?.kategori_target]);

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
      if (gender && m.jenis_kelamin !== gender) return false;
      if (category && m.kategori !== category) return false;
      if (
        deferredSearch &&
        !m.nama_lengkap.toLowerCase().includes(deferredSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [eligibleMembers, category, gender, deferredSearch]);

  const hadirCount = useMemo(
    () => Object.values(records).filter((s) => s === "HADIR").length,
    [records],
  );

  const totalRecords = useMemo(() => Object.keys(records).length, [records]);

  const progress = filteredMembers.length
    ? (hadirCount / filteredMembers.length) * 100
    : 0;

  /* ------------------------------- Mutations ------------------------------- */

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
    onSuccess: () => {
      setDeleteTarget(null);
    },
    onError: (err) => {
      setDeleteTarget(null);
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus absensi",
        "error",
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: (meetingId: string) => attendanceApi.removeByMeeting(meetingId),

    onMutate: async (meetingId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.attendancePage(meetingId),
      });

      const previous = queryClient.getQueryData<AttendancePageData>(
        queryKeys.attendancePage(meetingId),
      );

      if (previous) {
        queryClient.setQueryData<AttendancePageData>(
          queryKeys.attendancePage(meetingId),
          { ...previous, attendance: [] },
        );
      }

      return { previous };
    },

    onError: (err, meetingId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          queryKeys.attendancePage(meetingId),
          context.previous,
        );
      }
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus semua absensi",
        "error",
      );
      setConfirmResetAll(false);
    },

    onSuccess: () => {
      showToast("Semua absensi dihapus");
      setConfirmResetAll(false);
    },

    onSettled: (data, error, meetingId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendancePage(meetingId),
      });
    },
  });

  /* ================= FIX: deleteMeetingMutation ================= */
  const deleteMeetingMutation = useMutation({
    mutationFn: (meetingId: string) => meetingApi.remove(meetingId),
    onSuccess: (_data, meetingId) => {
      showToast("Jadwal dihapus");
      setDeleteMeetingTarget(null);

      // ✅ FIX: optimistic remove dari cache `meetings` — supaya card
      // "Jadwal dipilih" langsung hilang tanpa nunggu refetch.
      queryClient.setQueryData<Meeting[]>(
        queryKeys.meetings({ range: "recent" }),
        (old = []) => old.filter((m) => m.meeting_id !== meetingId),
      );

      // ✅ FIX: kalau yang dihapus = pinned, reset supaya fallback ke meeting lain.
      if (pinnedMeetingId === meetingId) {
        setPinnedMeetingId(null);
      }

      // Refetch di background untuk konsistensi dengan server.
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings({ range: "recent" }),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendancePage(meetingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
    onError: (err) => {
      setDeleteMeetingTarget(null);
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus jadwal",
        "error",
      );
    },
  });
  /* ============================================================= */

  /* -------------------------- Attendance Handlers ------------------------- */

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
        queryKey: queryKeys.attendancePage(selectedMeeting.meeting_id),
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
        queryKey: queryKeys.attendancePage(selectedMeeting.meeting_id),
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
      await attendanceApi.bulkSave(
        selectedMeeting.meeting_id,
        targets.map((m) => ({ member_id: m.member_id, status: "HADIR" })),
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendancePage(selectedMeeting.meeting_id),
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

  /* ------------------------------- Callbacks ------------------------------ */

  const handleStatusChange = useCallback(
    (memberId: string, status: AttendanceStatus) => {
      tapStatus(memberId, status);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMeetingId],
  );

  const handleRequestDelete = useCallback(
    (memberId: string, memberName: string) => {
      setDeleteTarget({ memberId, memberName });
    },
    [],
  );

  const canCreate = isAdminLike || role === "TIM_ABSENSI";

  const isInitialLoading =
    loadingMeetings || (!!selectedMeetingId && !attendanceReady);

  /* ------------------------ Sheet Navigation Logic ------------------------ */

  function openPicker() {
    setSheet({ view: "picker" });
  }

  function openAction(m: Meeting) {
    setSheet({ view: "action", meeting: m });
  }

  function openCreateForm(from: "picker" | "fab") {
    setSheet({ view: "form", mode: "create", from });
  }

  function openEditForm() {
    if (sheet.view !== "action") return;
    setSheet({ view: "form", mode: "edit", meeting: sheet.meeting });
  }

  function closeSheet() {
    setSheet({ view: "closed" });
  }

  function handleSheetClose() {
    if (sheet.view === "picker") {
      closeSheet();
    } else if (sheet.view === "action") {
      setSheet({ view: "picker" });
    } else if (sheet.view === "form") {
      if (sheet.mode === "edit") {
        setSheet({ view: "action", meeting: sheet.meeting });
      } else if (sheet.from === "picker") {
        setSheet({ view: "picker" });
      } else {
        closeSheet();
      }
    }
  }

  /* ================= FIX: handleFormSaved ================= */
  function handleFormSaved(m: Meeting, mode: "create" | "edit") {
    // ✅ FIX: optimistic update cache `meetings` — supaya card
    // "Jadwal dipilih" langsung update tanpa nunggu refetch.
    if (mode === "create") {
      queryClient.setQueryData<Meeting[]>(
        queryKeys.meetings({ range: "recent" }),
        (old = []) => {
          const exists = old.some((x) => x.meeting_id === m.meeting_id);
          if (exists) {
            return old.map((x) => (x.meeting_id === m.meeting_id ? m : x));
          }
          return [m, ...old];
        },
      );
      setPinnedMeetingId(m.meeting_id);
    } else {
      // mode === "edit"
      queryClient.setQueryData<Meeting[]>(
        queryKeys.meetings({ range: "recent" }),
        (old = []) => old.map((x) => (x.meeting_id === m.meeting_id ? m : x)),
      );
    }

    // Refetch di background untuk konsistensi.
    queryClient.invalidateQueries({
      queryKey: queryKeys.meetings({ range: "recent" }),
    });
    if (mode === "edit") {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendancePage(m.meeting_id),
      });
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });

    // Navigasi
    // ✅ FIX TS: cek `sheet.mode === "create"` dulu sebelum akses `sheet.from`
    // karena `from` hanya ada pada discriminated union mode "create".
    if (mode === "edit") {
      closeSheet();
    } else if (
      sheet.view === "form" &&
      sheet.mode === "create" &&
      sheet.from === "picker"
    ) {
      setSheet({ view: "picker" });
    } else {
      closeSheet();
    }
  }
  /* ============================================================= */
  /* ============================================================= */

  function handleDeleteFromAction(meeting: Meeting) {
    closeSheet();
    setDeleteMeetingTarget(meeting);
  }

  const sheetTitle = (() => {
    if (sheet.view === "picker") return "Pilih Jadwal Pengajian";
    if (sheet.view === "action") return "Aksi Jadwal";
    if (sheet.view === "form") {
      return sheet.mode === "edit"
        ? "Edit Jadwal Pengajian"
        : "Jadwal Pengajuan Baru";
    }
    return "";
  })();

  /* --------------------------------- Render -------------------------------- */

  return (
    <AppLayout
      fab={
        canCreate ? (
          <FloatingActionButton onClick={() => openCreateForm("fab")} />
        ) : undefined
      }
    >
      <Header
        title="Absensi"
        subtitle={
          selectedMeeting ? formatDateLong(selectedMeeting.tanggal) : undefined
        }
        showSyncButton={false}
      />

      {isReadonly && (
        <div
          className="sticky z-30 backdrop-blur-xl bg-info-soft/95 border-b border-info/20"
          style={{ top: "calc(52px + var(--safe-top))" }}
        >
          <div className="px-4 py-2">
            <p className="text-ios-caption text-info leading-relaxed">
              Anda masuk sebagai pengawas — hanya bisa melihat data absensi.
            </p>
          </div>
        </div>
      )}

      {isInitialLoading ? (
        <AttendancePageSkeleton rows={8} />
      ) : (
        <>
          <div className="pt-3 pb-2">
            {meetings.length > 0 ? (
              <div className="px-4">
                <div className="w-full min-h-[52px] rounded-2xl border border-surface-border bg-surface-card px-4 py-2.5 flex items-center gap-3 transition-all hover:border-accent/40">
                  <button
                    onClick={openPicker}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.99] transition-transform"
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
                          {formatDateLongText(selectedMeeting.tanggal)} ·{" "}
                          {selectedMeeting.jam || "—"}
                        </p>
                      )}
                      {selectedMeeting &&
                        normalizeTargets(selectedMeeting.kategori_target)
                          .length > 0 && (
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
              </div>
            ) : (
              <div className="px-4 rounded-2xl border border-dashed border-surface-border bg-surface-card p-4 text-center">
                <p className="text-ios-subhead text-surface-muted">
                  Belum ada jadwal pengajian
                </p>
                {canCreate && (
                  <button
                    onClick={() => openCreateForm("picker")}
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
                style={{
                  top: isReadonly
                    ? "calc(52px + var(--safe-top) + 34px)"
                    : "calc(52px + var(--safe-top))",
                }}
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

                <div className="px-4 pb-3 space-y-3">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
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

                  <GenderSegmented value={gender} onChange={setGender} />
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
                    {!isReadonly && totalRecords > 0 && (
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
                    {!isReadonly && (
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
                    )}
                    {isReadonly && (
                      <span className="text-ios-caption text-surface-muted italic">
                        Mode lihat
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-card">
                {filteredMembers.length === 0 && (
                  <EmptyState
                    title="Tidak ada jamaah"
                    description={
                      search || category || gender
                        ? "Coba ubah kata kunci atau filter."
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
                    onStatus={handleStatusChange}
                    onRequestDelete={handleRequestDelete}
                    divider={i !== filteredMembers.length - 1}
                    readonly={isReadonly}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ------------------ SINGLE BOTTOM SHEET ------------------ */}
      <BottomSheet
        open={sheet.view !== "closed"}
        onClose={handleSheetClose}
        title={sheetTitle}
      >
        {sheet.view === "picker" && (
          <MeetingPickerContent
            meetings={meetings}
            selectedId={selectedMeeting?.meeting_id}
            canCreate={canCreate}
            onSelect={(m) => {
              setPinnedMeetingId(m.meeting_id);
              closeSheet();
            }}
            onRequestAction={openAction}
            onCreateNew={() => openCreateForm("picker")}
            onCreateBulk={() => {
              closeSheet();
              navigate("/lainnya/jadwal");
            }}
          />
        )}
        {sheet.view === "action" && (
          <MeetingActionContent
            meeting={sheet.meeting}
            onEdit={openEditForm}
            onDelete={() => handleDeleteFromAction(sheet.meeting)}
          />
        )}

        {sheet.view === "form" && (
          <MeetingFormContent
            mode={sheet.mode}
            meeting={sheet.mode === "edit" ? sheet.meeting : null}
            onClose={handleSheetClose}
            onSaved={handleFormSaved}
          />
        )}
      </BottomSheet>

      {/* ------------------ Confirm Dialogs ------------------ */}
      <ConfirmDialog
        open={!!deleteMeetingTarget}
        title="Hapus jadwal pengajian?"
        description={
          deleteMeetingTarget
            ? `Jadwal "${deleteMeetingTarget.acara || "Pengajian"}" pada ${formatDateLongText(deleteMeetingTarget.tanggal)} akan dihapus permanen, BESERTA semua catatan absensi yang terkait. Tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        confirmLabel="Ya, Hapus"
        danger
        loading={deleteMeetingMutation.isPending}
        onCancel={() => setDeleteMeetingTarget(null)}
        onConfirm={() => {
          if (deleteMeetingTarget) {
            deleteMeetingMutation.mutate(deleteMeetingTarget.meeting_id);
          }
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
        loading={removeMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAttendance(deleteTarget.memberId);
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
        loading={resetMutation.isPending}
        onCancel={() => setConfirmResetAll(false)}
        onConfirm={resetAllAttendance}
      />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Compact Attendance Row                            */
/* -------------------------------------------------------------------------- */

const CompactAttendanceRow = memo(function CompactAttendanceRow({
  member,
  status,
  onStatus,
  onRequestDelete,
  divider,
  readonly = false,
}: {
  member: Member;
  status?: AttendanceStatus;
  onStatus: (memberId: string, s: AttendanceStatus) => void;
  onRequestDelete: (memberId: string, memberName: string) => void;
  divider?: boolean;
  readonly?: boolean;
}) {
  const longPressTimer = useRef<number | null>(null);
  const didLongPress = useRef(false);

  function startLongPress() {
    if (readonly) return;
    if (!status) return;
    didLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      didLongPress.current = true;
      onRequestDelete(member.member_id, member.nama_lengkap);
    }, 600);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    if (readonly) return;
    if (status) {
      e.preventDefault();
      onRequestDelete(member.member_id, member.nama_lengkap);
    }
  }

  if (readonly) {
    const config = status ? STATUS_CONFIG[status] : null;
    const Icon = config?.Icon;

    return (
      <div
        className={`flex items-center gap-2 px-4 min-h-[56px] ${
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

        {config && Icon ? (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-ios-footnote font-medium ${config.activeClass}`}
          >
            <Icon size={13} strokeWidth={2.4} />
            {config.label}
          </span>
        ) : (
          <span className="text-ios-footnote text-surface-muted italic px-2.5">
            Belum diabsen
          </span>
        )}
      </div>
    );
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
              onClick={() => onStatus(member.member_id, s)}
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
});

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Gender Segmented                              */
/* -------------------------------------------------------------------------- */

function GenderSegmented({
  value,
  onChange,
}: {
  value: "" | "L" | "P";
  onChange: (v: "" | "L" | "P") => void;
}) {
  const options: { value: "" | "L" | "P"; label: string }[] = [
    { value: "", label: "Semua" },
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];

  return (
    <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
      {options.map((opt, idx) => {
        const active = value === opt.value;
        return (
          <div key={opt.value} className="flex-1 flex">
            {idx > 0 && <div className="w-px bg-surface-border" />}
            <button
              onClick={() => onChange(opt.value)}
              className={`flex-1 min-h-[36px] flex items-center justify-center text-ios-footnote font-medium transition-all duration-200 active:scale-[0.98] ${
                active
                  ? "bg-accent text-white"
                  : "text-surface-muted hover:bg-surface-card"
              }`}
            >
              {opt.label}
            </button>
          </div>
        );
      })}
    </div>
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

/* -------------------------------------------------------------------------- */
/*                      Sheet Content: PICKER VIEW                            */
/* -------------------------------------------------------------------------- */

function MeetingPickerContent({
  meetings,
  selectedId,
  canCreate,
  onSelect,
  onRequestAction,
  onCreateNew,
  onCreateBulk,
}: {
  meetings: Meeting[];
  selectedId?: string;
  canCreate: boolean;
  onSelect: (m: Meeting) => void;
  onRequestAction: (m: Meeting) => void;
  onCreateNew: () => void;
  onCreateBulk: () => void;
}) {
  return (
    <>
      <div className="space-y-2">
        {meetings.map((m) => {
          const active = m.meeting_id === selectedId;
          const targets = normalizeTargets(m.kategori_target);
          return (
            <div
              key={m.meeting_id}
              className={`w-full rounded-2xl border p-3.5 flex items-center gap-3 transition-all ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-surface-border bg-surface-card hover:bg-surface-card2"
              }`}
            >
              <button
                onClick={() => onSelect(m)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.99] transition-transform"
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
                    {formatDateLongText(m.tanggal)} · {m.jam || "—"}
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

              {canCreate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestAction(m);
                  }}
                  aria-label={`Aksi jadwal ${m.acara || "Pengajian"}`}
                  title="Aksi jadwal"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-surface-muted transition-colors hover:bg-surface-card2 hover:text-surface-text active:scale-95 flex-shrink-0"
                >
                  <MoreVertical size={16} strokeWidth={2.2} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {canCreate && (
        <>
          {/* Tambah 1 jadwal (existing) */}
          <button
            onClick={onCreateNew}
            className="mt-3 w-full min-h-[48px] rounded-2xl border-2 border-dashed border-surface-border text-ios-subhead font-medium text-accent flex items-center justify-center gap-1.5 transition-colors hover:bg-accent-soft/50 active:scale-[0.99]"
          >
            <Plus size={16} /> Buat jadwal baru
          </button>

          {/* Tambah massal (BARU) */}
          <button
            onClick={onCreateBulk}
            className="mt-2 w-full min-h-[48px] rounded-2xl border-2 border-dashed border-accent/30 bg-accent-soft/30 text-ios-subhead font-medium text-accent flex items-center justify-center gap-1.5 transition-colors hover:bg-accent-soft/60 active:scale-[0.99]"
          >
            <Calendar size={16} /> Buat jadwal massal
          </button>
        </>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                      Sheet Content: ACTION VIEW                            */
/* -------------------------------------------------------------------------- */

function MeetingActionContent({
  meeting,
  onEdit,
  onDelete,
}: {
  meeting: Meeting;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3 p-3.5 rounded-2xl bg-surface-card2 border border-surface-border">
        <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center flex-shrink-0">
          <Calendar size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-surface-text truncate">
            {meeting.hari} — {meeting.acara || "Pengajian"}
          </p>
          <p className="text-ios-footnote text-surface-muted truncate">
            {formatDateLongText(meeting.tanggal)} · {meeting.jam || "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onEdit}
          className="w-full text-left rounded-2xl border border-surface-border bg-surface-card p-3.5 flex items-center gap-3 transition-all hover:bg-surface-card2 active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-xl bg-info-soft text-info flex items-center justify-center flex-shrink-0">
            <Pencil size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ios-body font-medium text-surface-text">
              Edit Jadwal
            </p>
            <p className="text-ios-footnote text-surface-muted">
              Ubah tanggal, jam, acara, atau kategori
            </p>
          </div>
        </button>

        <button
          onClick={onDelete}
          className="w-full text-left rounded-2xl border border-danger/20 bg-danger-soft p-3.5 flex items-center gap-3 transition-all hover:bg-danger-soft/80 active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ios-body font-medium text-danger">
              Hapus Jadwal
            </p>
            <p className="text-ios-footnote text-danger/80">
              Absensi terkait juga akan dihapus
            </p>
          </div>
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-warning-soft/60 border border-warning/20">
        <AlertTriangle
          size={16}
          strokeWidth={2.2}
          className="text-warning flex-shrink-0 mt-0.5"
        />
        <p className="text-ios-caption text-warning leading-relaxed">
          Menghapus jadwal akan menghapus <strong>semua catatan absensi</strong>{" "}
          yang terkait. Pastikan Anda sudah yakin.
        </p>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                      Sheet Content: FORM VIEW                              */
/* -------------------------------------------------------------------------- */

function MeetingFormContent({
  mode,
  meeting,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  meeting: Meeting | null;
  onClose: () => void;
  onSaved: (m: Meeting, mode: "create" | "edit") => void;
}) {
  const { showToast } = useToast();
  const isEdit = mode === "edit";

  const [tanggal, setTanggal] = useState(getTodayIso());
  const [jam, setJam] = useState("Isya di tempat");
  const [groupId, setGroupId] = useState("");
  const [acara, setAcara] = useState("Sambung Kelompok");
  const [kategoriTarget, setKategoriTarget] = useState<MemberCategory[]>([]);

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (isEdit && meeting) {
      setTanggal(meeting.tanggal || getTodayIso());
      setJam(meeting.jam || "Isya di tempat");
      setGroupId(meeting.group_id || "");
      setAcara(meeting.acara || "Sambung Kelompok");
      setKategoriTarget(
        Array.isArray(meeting.kategori_target)
          ? (meeting.kategori_target as MemberCategory[])
          : [],
      );
    } else {
      setTanggal(getTodayIso());
      setJam("Isya di tempat");
      setGroupId("");
      setAcara("Sambung Kelompok");
      setKategoriTarget([]);
    }
  }, [isEdit, meeting]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        tanggal,
        jam,
        group_id: groupId,
        acara,
        kategori_target: kategoriTarget,
      };
      if (isEdit && meeting) {
        return meetingApi.update({
          ...payload,
          meeting_id: meeting.meeting_id,
        });
      }
      return meetingApi.create(payload);
    },
    onSuccess: (result) => {
      showToast(isEdit ? "Jadwal diperbarui" : "Jadwal pengajian dibuat");
      onSaved(result as Meeting, mode);
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "Gagal memperbarui jadwal"
            : "Gagal membuat jadwal",
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
    <>
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
        {mutation.isPending
          ? "Menyimpan..."
          : isEdit
            ? "Simpan Perubahan"
            : "Buat Jadwal"}
      </Button>
    </>
  );
}
