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
  X,
  Plus,
  Check,
  Thermometer,
  CircleAlert,
  ChevronDown,
  Calendar,
  CalendarCheck,
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
import {
  GenderTargetPicker,
  getGenderTarget,
} from "../components/jadwal/GenderTargetPicker";
import type { GenderTarget } from "../components/jadwal/GenderTargetPicker";

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
  IZIN: {
    label: "Izin",
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
  ALPA: {
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
  | { view: "create-picker" }
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
  const [confirmLibur, setConfirmLibur] = useState<Meeting | null>(null);

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
    let list = members;

    const targets = normalizeTargets(selectedMeeting?.kategori_target);
    if (targets.length > 0) {
      list = list.filter((m) => m.kategori && targets.includes(m.kategori));
    }

    const gt = getGenderTarget(selectedMeeting);
    if (gt) {
      list = list.filter((m) => m.jenis_kelamin === gt);
    }

    return list;
  }, [
    members,
    selectedMeeting?.kategori_target,
    selectedMeeting?.gender_target,
  ]);

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

  /* -------------------------- Libur Mutation ------------------------ */

  const liburMutation = useMutation({
    mutationFn: ({ meetingId, status }: { meetingId: string; status: string }) =>
      meetingApi.update({ meeting_id: meetingId, status }),
    onSuccess: (_data, vars) => {
      showToast(
        vars.status === "LIBUR"
          ? "Jadwal ditandai libur"
          : "Jadwal diaktifkan kembali",
      );
      setSheet({ view: "closed" });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings({ range: "recent" }),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendancePage(vars.meetingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal mengubah status jadwal",
        "error",
      );
    },
  });
  /* ============================================================= */

  /* -------------------------- Bulk Delete Mutation ------------------------ */

  const deleteBulkMutation = useMutation({
    mutationFn: (ids: string[]) => meetingApi.removeBulk(ids),
    onSuccess: (res) => {
      showToast(res.deleted + " jadwal dihapus");
      if (pinnedMeetingId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.meetings({ range: "recent" }),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings({ range: "recent" }),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal hapus jadwal",
        "error",
      );
    },
  });

  async function handleDeleteBulk(ids: string[]): Promise<void> {
    await deleteBulkMutation.mutateAsync(ids);
  }

  /* -------------------------- Attendance Handlers ------------------------- */

  async function tapStatus(memberId: string, status: AttendanceStatus) {
    if (!selectedMeeting) return;
    if (selectedMeeting.status === "LIBUR") {
      showToast("Jadwal libur — absensi tidak dapat diubah", "warning");
      return;
    }
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

  function executeToggleLibur(meeting: Meeting) {
    liburMutation.mutate({
      meetingId: meeting.meeting_id,
      status: meeting.status === "LIBUR" ? "SCHEDULED" : "LIBUR",
    });
  }

  function handleToggleLibur(meeting: Meeting) {
    const willBeLibur = meeting.status !== "LIBUR";
    if (willBeLibur) {
      setConfirmLibur(meeting);
      return;
    }
    executeToggleLibur(meeting);
  }

  /* ------------------------------- Callbacks ------------------------------ */

  function handleStatusChange(memberId: string, status: AttendanceStatus) {
    tapStatus(memberId, status);
  }

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
    if (sheet.view === "create-picker") {
      closeSheet();
    } else if (sheet.view === "picker") {
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
    if (sheet.view === "create-picker") return "Buat Jadwal";
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
          <FloatingActionButton onClick={() => setSheet({ view: "create-picker" })} />
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
          <div className="pt-3 pb-2 flex-1 flex flex-col">
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
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-medium text-surface-muted uppercase tracking-wide">
                          Jadwal dipilih
                        </p>
                        {selectedMeeting?.status === "LIBUR" && (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wide bg-danger text-white rounded-full px-2 py-0.5 shrink-0">
                            Libur
                          </span>
                        )}
                      </div>
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {selectedMeeting
                          ? `${selectedMeeting.hari} - ${selectedMeeting.acara || "Pengajian"}`
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
              <EmptyState
                icon={<Calendar size={26} className="text-accent" />}
                title="Belum ada jadwal pengajian"
                description="Buat jadwal pertama untuk mulai mencatat absensi."
                action={
                  canCreate ? (
                    <Button
                      onClick={() => setSheet({ view: "create-picker" })}
                      leftIcon={<Plus size={14} />}
                    >
                      Buat Jadwal Pertama
                    </Button>
                  ) : undefined
                }
              />
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
                {selectedMeeting.status === "LIBUR" && (
                  <div className="mx-4 my-3 p-3 rounded-xl bg-warning-soft border border-warning/20 flex items-start gap-2.5">
                    <AlertTriangle
                      size={14}
                      className="text-warning flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-ios-caption font-semibold text-warning">
                        Jadwal Libur
                      </p>
                      <p className="text-ios-caption text-warning/80 leading-relaxed mt-0.5">
                        Absensi tidak dihitung dalam persentase kehadiran dan
                        tidak dapat diubah.
                      </p>
                    </div>
                  </div>
                )}

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
                    readonly={isReadonly || selectedMeeting.status === "LIBUR"}
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
        {sheet.view === "create-picker" && (
          <CreatePickerContent
            onSingle={() => openCreateForm("fab")}
            onBulk={() => {
              closeSheet();
              navigate("/lainnya/jadwal?tab=bulk");
            }}
          />
        )}
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
            onDeleteBulk={handleDeleteBulk}
          />
        )}
        {sheet.view === "action" && (
          <MeetingActionContent
            meeting={sheet.meeting}
            liburLoading={liburMutation.isPending}
            onToggleLibur={() => handleToggleLibur(sheet.meeting)}
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

      <ConfirmDialog
        open={!!confirmLibur}
        title="Tandai jadwal libur?"
        description={
          confirmLibur
            ? `Jadwal "${confirmLibur.acara || "Pengajian"}" akan ditandai libur. Absensi yang sudah ada tidak akan dihitung dalam persentase kehadiran dan tidak dapat diubah.`
            : ""
        }
        confirmLabel="Ya, Tandai Libur"
        loading={liburMutation.isPending}
        onCancel={() => setConfirmLibur(null)}
        onConfirm={() => {
          if (confirmLibur) {
            executeToggleLibur(confirmLibur);
            setConfirmLibur(null);
          }
        }}
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

function CreatePickerContent({
  onSingle,
  onBulk,
}: {
  onSingle: () => void;
  onBulk: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="rounded-2xl bg-accent-soft border border-accent/15 p-3.5 mb-3">
        <p className="text-ios-footnote text-accent/90 leading-relaxed">
          Pilih cara membuat jadwal pengajian.
        </p>
      </div>

      <button
        onClick={onSingle}
        className="w-full text-left rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3 transition-all hover:bg-surface-card2 active:scale-[0.99]"
      >
        <div className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0">
          <Plus size={20} strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-surface-text">
            Buat 1 Jadwal
          </p>
          <p className="text-ios-caption text-surface-muted">
            Untuk pengajian tunggal — isi tanggal & acara
          </p>
        </div>
        <ChevronDown size={16} className="text-surface-muted -rotate-90 flex-shrink-0" />
      </button>

      <button
        onClick={onBulk}
        className="w-full text-left rounded-2xl border border-accent/25 bg-accent-soft p-4 flex items-center gap-3 transition-all hover:bg-accent-soft/80 active:scale-[0.99]"
      >
        <div className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0">
          <Calendar size={20} strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-accent">
            Buat Massal
          </p>
          <p className="text-ios-caption text-accent/80">
            1 bulan sekaligus — pilih bulan & hari rutin
          </p>
        </div>
        <ChevronDown size={16} className="text-accent/70 -rotate-90 flex-shrink-0" />
      </button>
    </div>
  );
}

function MeetingPickerContent({
  meetings,
  selectedId,
  canCreate,
  onSelect,
  onRequestAction,
  onCreateNew,
  onCreateBulk,
  onDeleteBulk,
}: {
  meetings: Meeting[];
  selectedId?: string;
  canCreate: boolean;
  onSelect: (m: Meeting) => void;
  onRequestAction: (m: Meeting) => void;
  onCreateNew: () => void;
  onCreateBulk: () => void;
  onDeleteBulk: (ids: string[]) => Promise<void>;
}) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const today = getTodayIso();

  /* --------------------------- Filter & Group --------------------------- */

  const filtered = useMemo(() => {
    if (!deferredSearch.trim()) return meetings;
    const q = deferredSearch.toLowerCase().trim();
    return meetings.filter((m) => {
      const hay =
        (m.acara || "").toLowerCase() +
        " " +
        (m.hari || "").toLowerCase() +
        " " +
        (m.tanggal || "") +
        " " +
        (m.jam || "").toLowerCase();
      return hay.includes(q);
    });
  }, [meetings, deferredSearch]);

  const grouped = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of filtered) {
      const monthKey = m.tanggal.slice(0, 7);
      const list = map.get(monthKey) ?? [];
      list.push(m);
      map.set(monthKey, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([monthKey, items]) => ({
        monthKey,
        label: formatMonthLabel(monthKey),
        items: [...items].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
      }));
  }, [filtered]);

  const hasSearch = search.trim().length > 0;
  const totalVisible = filtered.length;
  const allVisibleSelected =
    totalVisible > 0 && filtered.every((m) => selectedIds.has(m.meeting_id));
  const selectedCount = selectedIds.size;

  /* --------------------------- Selection Actions --------------------------- */

  function enterSelectionMode(initialId?: string) {
    setSelectionMode(true);
    if (initialId) {
      setSelectedIds(new Set([initialId]));
    } else {
      setSelectedIds(new Set());
    }
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.meeting_id)));
    }
  }

  async function handleConfirmDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      await onDeleteBulk(ids);
      setConfirmOpen(false);
      exitSelectionMode();
    } catch {
      // toast handled di parent
    } finally {
      setDeleting(false);
    }
  }

  const selectedMeetings = filtered.filter((m) =>
    selectedIds.has(m.meeting_id),
  );

  /* ------------------------------- Render -------------------------------- */

  return (
    <>
      {/* Toolbar selection mode */}
      {selectionMode ? (
        <div className="-mx-4 px-4 py-2 mb-3 bg-accent text-white rounded-2xl flex items-center gap-2">
          <button
            onClick={exitSelectionMode}
            aria-label="Keluar pilihan"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-white/15"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
          <span className="flex-1 text-ios-footnote font-semibold tabular-nums">
            {selectedCount} dipilih
          </span>
          <button
            onClick={toggleSelectAll}
            disabled={totalVisible === 0}
            className="text-ios-caption font-semibold px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            {allVisibleSelected ? "Batal Semua" : "Pilih Semua"}
          </button>
        </div>
      ) : (
        meetings.length > 0 &&
        canCreate && (
          <div className="flex justify-end mb-3">
            <button
              onClick={() => enterSelectionMode()}
              className="text-ios-caption font-medium text-accent px-3 py-1.5 rounded-lg transition-colors hover:bg-accent-soft active:scale-[0.97]"
            >
              Pilih
            </button>
          </div>
        )
      )}

      {/* Search */}
      {meetings.length > 0 && !selectionMode && (
        <div className="relative mb-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari acara, tanggal, atau jam..."
            className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {hasSearch && (
            <button
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {meetings.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center mb-3">
          <p className="text-ios-body font-medium text-surface-text mb-1">
            Tidak ditemukan
          </p>
          <p className="text-ios-footnote text-surface-muted">
            Coba kata kunci lain
          </p>
        </div>
      )}

      {/* Grouped list */}
      {grouped.map(({ monthKey, label, items }) => (
        <section key={monthKey} className="mb-4">
          <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-surface-bg/95 backdrop-blur-sm border-b border-surface-border/60">
            <div className="flex items-center justify-between">
              <p className="text-ios-footnote font-semibold text-surface-text">
                {label}
              </p>
              <span className="text-ios-caption text-surface-muted tabular-nums">
                {items.length} jadwal
              </span>
            </div>
          </div>

          <div className="mt-2 rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            {items.map((m, i) => {
              const active = m.meeting_id === selectedId;
              const isToday = m.tanggal === today;
              const targets = normalizeTargets(m.kategori_target);
              const isSelected = selectedIds.has(m.meeting_id);

              return (
                <div
                  key={m.meeting_id}
                  className={`flex items-center gap-2 px-3 ${
                    i !== items.length - 1
                      ? "border-b border-surface-border"
                      : ""
                  } ${
                    isSelected
                      ? "bg-accent-soft/60"
                      : active
                        ? "bg-accent-soft/40"
                        : isToday
                          ? "bg-success-soft/20"
                          : ""
                  }`}
                >
                  {selectionMode && (
                    <button
                      onClick={() => toggleSelect(m.meeting_id)}
                      aria-label={isSelected ? "Batal pilih" : "Pilih"}
                      className={
                        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all " +
                        (isSelected
                          ? "bg-accent text-white"
                          : "border-2 border-surface-border bg-transparent")
                      }
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  )}

                  <button
                    onContextMenu={(e) => {
                      if (!canCreate || selectionMode) return;
                      e.preventDefault();
                      enterSelectionMode(m.meeting_id);
                    }}
                    onTouchStart={(e) => {
                      if (!canCreate || selectionMode) return;
                      const target = e.currentTarget;
                      const timer = window.setTimeout(() => {
                        enterSelectionMode(m.meeting_id);
                      }, 600);
                      (target as any)._lpTimer = timer;
                    }}
                    onTouchEnd={(e) => {
                      const target = e.currentTarget as any;
                      if (target._lpTimer) {
                        clearTimeout(target._lpTimer);
                        target._lpTimer = null;
                      }
                    }}
                    onTouchMove={(e) => {
                      const target = e.currentTarget as any;
                      if (target._lpTimer) {
                        clearTimeout(target._lpTimer);
                        target._lpTimer = null;
                      }
                    }}
                    onClick={() => {
                      if (selectionMode) {
                        toggleSelect(m.meeting_id);
                      } else {
                        onSelect(m);
                      }
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left py-2.5 active:scale-[0.995] transition-transform"
                  >
                    <div
                      className={
                        "w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 " +
                        (isSelected
                          ? "bg-accent text-white"
                          : active
                            ? "bg-accent text-white"
                            : isToday
                              ? "bg-success text-white"
                              : "bg-surface-card2 text-surface-muted")
                      }
                    >
                      <span className="text-[8px] font-semibold uppercase tracking-wide leading-none">
                        {m.hari.slice(0, 3)}
                      </span>
                      <span className="text-[13px] font-bold leading-none mt-0.5 tabular-nums">
                        {parseInt(m.tanggal.slice(8, 10), 10)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p
                          className={
                            "text-ios-footnote font-medium truncate " +
                            (active && !selectionMode
                              ? "text-accent"
                              : "text-surface-text")
                          }
                        >
                          {m.acara || "Pengajian"}
                        </p>
                        {isToday && !active && !selectionMode && (
                          <span className="text-[8px] font-bold tracking-wide text-success bg-success-soft rounded-full px-1.5 py-0.5 uppercase flex-shrink-0">
                            Hari ini
                          </span>
                        )}
                        {active && !selectionMode && (
                          <Check
                            size={12}
                            className="text-accent flex-shrink-0"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <p className="text-ios-caption text-surface-muted truncate">
                        {m.jam || "—"}
                        {targets.length > 0 &&
                          " · " +
                            targets
                              .slice(0, 2)
                              .map((k) => CATEGORY_LABEL[k])
                              .join(", ")}
                        {targets.length > 2 && " +" + (targets.length - 2)}
                      </p>
                    </div>
                  </button>

                  {canCreate && !selectionMode && (
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
        </section>
      ))}

      {canCreate && !selectionMode && (
        <div className="pt-2 space-y-2">
          <button
            onClick={onCreateNew}
            className="w-full min-h-[44px] rounded-2xl border-2 border-dashed border-surface-border text-ios-footnote font-medium text-accent flex items-center justify-center gap-1.5 transition-colors hover:bg-accent-soft/50 active:scale-[0.99]"
          >
            <Plus size={14} /> Buat 1 jadwal
          </button>

          <button
            onClick={onCreateBulk}
            className="w-full min-h-[44px] rounded-2xl border-2 border-dashed border-accent/30 bg-accent-soft/30 text-ios-footnote font-medium text-accent flex items-center justify-center gap-1.5 transition-colors hover:bg-accent-soft/60 active:scale-[0.99]"
          >
            <Calendar size={14} /> Buat jadwal massal
          </button>
        </div>
      )}

      {selectionMode && (
        <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-2 bg-surface-bg/95 backdrop-blur border-t border-surface-border">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={selectedCount === 0 || deleting}
            className="w-full min-h-[48px] rounded-2xl bg-danger text-white text-ios-footnote font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} strokeWidth={2.4} />
            Hapus {selectedCount > 0 ? selectedCount + " " : ""}Jadwal
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={"Hapus " + selectedCount + " Jadwal?"}
        description={
          selectedMeetings.length > 0
            ? "Jadwal berikut akan dihapus permanen:\n" +
              selectedMeetings
                .slice(0, 5)
                .map((m) => "• " + m.tanggal + " · " + (m.acara || "Pengajian"))
                .join("\n") +
              (selectedMeetings.length > 5
                ? "\n• +" + (selectedMeetings.length - 5) + " lainnya"
                : "") +
              "\n\nSemua catatan absensi terkait ikut terhapus."
            : ""
        }
        confirmLabel={deleting ? "Menghapus..." : "Ya, Hapus"}
        danger
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  if (!y || !m || m < 1 || m > 12) return monthKey;
  return BULAN[m - 1] + " " + y;
}

function MeetingActionContent({
  meeting,
  onToggleLibur,
  liburLoading,
  onEdit,
  onDelete,
}: {
  meeting: Meeting;
  onToggleLibur: () => void;
  liburLoading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isLibur = meeting.status === "LIBUR";
  return (
    <>
      <div className="mb-4 flex items-center gap-3 p-3.5 rounded-2xl bg-surface-card2 border border-surface-border">
        <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center flex-shrink-0">
          <Calendar size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-medium text-surface-text truncate">
            {meeting.hari} — {meeting.acara || "Pengajian"}
            {isLibur && (
              <span className="ml-2 inline-block text-[10px] font-semibold bg-danger-soft text-danger rounded-full px-2 py-0.5 align-middle">
                Libur
              </span>
            )}
          </p>
          <p className="text-ios-footnote text-surface-muted truncate">
            {formatDateLongText(meeting.tanggal)} · {meeting.jam || "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onToggleLibur}
          disabled={liburLoading}
          className="w-full text-left rounded-2xl border border-warning/25 bg-warning-soft p-3.5 flex items-center gap-3 transition-all hover:bg-warning-soft/80 active:scale-[0.99] disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-warning text-white flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ios-body font-medium text-warning">
              {isLibur ? "Aktifkan Kembali" : "Tandai Libur"}
            </p>
            <p className="text-ios-footnote text-warning/80">
              {isLibur
                ? "Jadwal akan dihitung kembali dalam absensi"
                : "Jadwal libur tidak dihitung dalam persentase absensi"}
            </p>
          </div>
        </button>

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
  const [genderTarget, setGenderTarget] = useState<GenderTarget>("");

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
      setGenderTarget(getGenderTarget(meeting));
    } else {
      setTanggal(getTodayIso());
      setJam("Isya di tempat");
      setGroupId("");
      setAcara("Sambung Kelompok");
      setKategoriTarget([]);
      setGenderTarget("");
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
        gender_target: genderTarget,
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

      <GenderTargetPicker
        value={genderTarget}
        onChange={setGenderTarget}
      />

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
