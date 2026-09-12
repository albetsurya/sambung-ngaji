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
import type { Meeting, Member, AttendanceStatus, Group } from "../types";
import { formatDateLong, getHariFromDate } from "../utils/format";
import { ATTENDANCE_STATUSES, MEMBER_CATEGORIES } from "../constants";
import { CATEGORY_LABEL } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import {
  AttendanceListSkeleton,
  AttendancePageSkeleton,
} from "../components/common/Skeleton";

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

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});

  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [isSwitchingMeeting, setIsSwitchingMeeting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [meetingPickerOpen, setMeetingPickerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingMeetings(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const from = new Date(Date.now() - 14 * 86400000)
          .toISOString()
          .slice(0, 10);
        const list = await meetingApi.list({ from });
        setMeetings(list);
        const todays = list.find((m) => m.tanggal === today) || list[0] || null;
        setSelectedMeeting(todays);
      } catch (err) {
        showToast(
          err instanceof ApiError
            ? err.message
            : "Gagal memuat jadwal pengajian",
          "error",
        );
      } finally {
        setLoadingMeetings(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedMeeting) {
      setMembers([]);
      setRecords({});
      return;
    }

    setMembers([]);
    setRecords({});
    setLoadingAttendance(true);

    (async () => {
      try {
        const [mList, att] = await Promise.all([
          memberApi.listForAttendance({}),
          attendanceApi.byMeeting(selectedMeeting.meeting_id),
        ]);
        setMembers(mList);
        const map: Record<string, AttendanceStatus> = {};
        att.forEach((a) => {
          map[a.member_id] = a.status;
        });
        setRecords(map);
      } catch (err) {
        showToast(
          err instanceof ApiError ? err.message : "Gagal memuat data absensi",
          "error",
        );
      } finally {
        setLoadingAttendance(false);
        setIsSwitchingMeeting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeeting]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (category && m.kategori !== category) return false;
      if (
        search &&
        !m.nama_lengkap.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [members, category, search]);

  const hadirCount = useMemo(
    () => Object.values(records).filter((s) => s === "HADIR").length,
    [records],
  );

  const totalRecords = useMemo(() => Object.keys(records).length, [records]);

  const progress = filteredMembers.length
    ? (hadirCount / filteredMembers.length) * 100
    : 0;

  async function tapStatus(memberId: string, status: AttendanceStatus) {
    if (!selectedMeeting) return;
    const prev = records[memberId];
    const nextStatus = prev === status ? undefined : status;

    setRecords((r) => {
      const next = { ...r };
      if (nextStatus) next[memberId] = nextStatus;
      else delete next[memberId];
      return next;
    });

    try {
      if (nextStatus) {
        await attendanceApi.save({
          meeting_id: selectedMeeting.meeting_id,
          member_id: memberId,
          status: nextStatus,
        });
      } else {
        await attendanceApi.remove({
          meeting_id: selectedMeeting.meeting_id,
          member_id: memberId,
        });
      }
    } catch (err) {
      setRecords((r) => {
        const next = { ...r };
        if (prev) next[memberId] = prev;
        else delete next[memberId];
        return next;
      });
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan absensi",
        "error",
      );
    }
  }

  async function deleteAttendance(memberId: string) {
    if (!selectedMeeting) return;
    const prev = records[memberId];
    if (!prev) return;

    setRecords((r) => {
      const next = { ...r };
      delete next[memberId];
      return next;
    });

    try {
      await attendanceApi.remove({
        meeting_id: selectedMeeting.meeting_id,
        member_id: memberId,
      });
      showToast("Absensi dihapus");
    } catch (err) {
      setRecords((r) => ({ ...r, [memberId]: prev }));
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus absensi",
        "error",
      );
    }
  }

  async function markAllPresent() {
    if (!selectedMeeting) return;
    const targets = filteredMembers.filter(
      (m) => records[m.member_id] !== "HADIR",
    );
    if (!targets.length) return;

    const prevRecords = { ...records };
    setRecords((r) => {
      const next = { ...r };
      targets.forEach((m) => {
        next[m.member_id] = "HADIR";
      });
      return next;
    });

    setSaving(true);
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
      showToast(`${targets.length} jamaah ditandai hadir`);
    } catch (err) {
      setRecords(prevRecords);
      showToast(
        err instanceof ApiError ? err.message : "Gagal menandai semua hadir",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetAllAttendance() {
    if (!selectedMeeting) return;

    const prevRecords = { ...records };
    setRecords({});
    setResettingAll(true);

    try {
      await attendanceApi.removeByMeeting(selectedMeeting.meeting_id);
      showToast("Semua absensi dihapus");
    } catch (err) {
      setRecords(prevRecords);
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus semua absensi",
        "error",
      );
    } finally {
      setResettingAll(false);
      setConfirmResetAll(false);
    }
  }

  const canCreate = isAdminLike || role === "TIM_ABSENSI";
  const isInitialLoading =
    loadingMeetings || (!!selectedMeeting && loadingAttendance);

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
          <div className="pt-3 pb-2 animate-[fadeIn_0.2s_ease-out]">
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
                        ? `${selectedMeeting.hari} — ${
                            selectedMeeting.acara || "Pengajian"
                          }`
                        : "Pilih jadwal"}
                    </p>
                    {selectedMeeting && (
                      <p className="text-ios-footnote text-surface-muted truncate">
                        {selectedMeeting.tanggal} · {selectedMeeting.jam || "—"}
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
              <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-4 text-center">
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
                        disabled={saving || loadingAttendance || resettingAll}
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
                        saving ||
                        loadingAttendance ||
                        hadirCount === filteredMembers.length
                      }
                      className="text-ios-footnote font-medium bg-accent-soft text-accent px-3 h-8 rounded-lg transition-colors hover:opacity-80 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving ? "Menyimpan..." : "Hadir semua"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card">
                {loadingAttendance && <AttendanceListSkeleton rows={8} />}

                {!loadingAttendance && filteredMembers.length === 0 && (
                  <EmptyState
                    title="Tidak ada jamaah"
                    description={
                      search || category
                        ? "Coba ubah kata kunci atau filter kategori."
                        : "Belum ada jamaah yang terdaftar di kelompok ini."
                    }
                  />
                )}

                {!loadingAttendance &&
                  filteredMembers.map((m, i) => (
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
          setIsSwitchingMeeting(true);
          setSelectedMeeting(m);
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
          setMeetings((prev) => [m, ...prev]);
          setSelectedMeeting(m);
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

      <LoadingOverlay open={isSwitchingMeeting} label="Memuat absensi..." />
      <LoadingOverlay open={saving} label="Menyimpan absensi..." />
      <LoadingOverlay open={resettingAll} label="Menghapus absensi..." />
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
                  {m.tanggal} · {m.jam || "—"}
                </p>
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jam, setJam] = useState("Isya di tempat");
  const [groupId, setGroupId] = useState("");
  const [acara, setAcara] = useState("Sambung Kelompok");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open)
      groupApi
        .list()
        .then(setGroups)
        .catch(() => {});
  }, [open]);

  async function handleCreate() {
    setSaving(true);
    try {
      const meeting = await meetingApi.create({
        tanggal,
        jam,
        group_id: groupId,
        acara,
      });
      showToast("Jadwal pengajian dibuat");
      onCreated(meeting);
      onClose();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat jadwal",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Jadwal Pengajian Baru">
      <Input
        label="Tanggal"
        type="date"
        value={tanggal}
        onChange={(e) => setTanggal(e.target.value)}
      />
      <p className="text-xs text-surface-muted -mt-3 mb-4">
        Hari: {getHariFromDate(tanggal)}
      </p>
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
      <Button fullWidth onClick={handleCreate} disabled={saving}>
        {saving ? "Menyimpan..." : "Buat Jadwal"}
      </Button>
    </BottomSheet>
  );
}
