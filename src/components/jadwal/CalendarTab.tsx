import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import idLocale from "@fullcalendar/core/locales/id";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingApi, groupApi } from "../../services/domainApi";
import { queryKeys } from "../../lib/queryClient";
import { useToast } from "../../contexts/ToastContext";

import { DateInput } from "../common/DateInput";
import { GenderTargetPicker, getGenderTarget } from "./GenderTargetPicker";
import type { GenderTarget } from "./GenderTargetPicker";
import { MEMBER_CATEGORIES } from "../../constants";
import {
  CATEGORY_LABEL,
  formatDateLongText,
  getHariFromDate,
  getTodayIso,
} from "../../utils/format";
import { ApiError } from "../../services/api";
import { Calendar, Check, ChevronRight, Pencil, Trash2 } from "../common/FontAwesomeIcons";
import type { Meeting, MemberCategory } from "../../types";
import { EventClickArg } from "@fullcalendar/core/index.js";
import { BottomSheet, Button, ConfirmDialog, Input, Select } from "../common";
import { CalendarSkeleton } from "../common/Skeleton";

type ModalState =
  | { view: "closed" }
  | { view: "detail"; meeting: Meeting }
  | { view: "form"; mode: "create"; tanggal: string }
  | { view: "form"; mode: "edit"; meeting: Meeting };

export function CalendarTab() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [range, setRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  });

  const [modal, setModal] = useState<ModalState>({ view: "closed" });
  const [confirmDelete, setConfirmDelete] = useState<Meeting | null>(null);

  const meetingsQuery = useQuery({
    queryKey: ["meetings", "calendar", range],
    queryFn: () => meetingApi.list({ from: range.from, to: range.to }),
    staleTime: 2 * 60_000,
  });

  const meetings = meetingsQuery.data ?? [];

  const events = useMemo(
    () =>
      meetings.map((m: Meeting) => ({
        id: m.meeting_id,
        title: m.acara || "Pengajian",
        date: m.tanggal,
        extendedProps: { meeting: m },
      })),
    [meetings],
  );

  function handleDateClick(arg: DateClickArg) {
    setModal({ view: "form", mode: "create", tanggal: arg.dateStr });
  }

  function handleEventClick(arg: EventClickArg) {
    const meeting = arg.event.extendedProps.meeting as Meeting;
    setModal({ view: "detail", meeting });
  }

  function closeModal() {
    setModal({ view: "closed" });
  }

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["meetings", "calendar"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.meetings() });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
  }

  // Request delete dari detail sheet → tutup sheet, buka ConfirmDialog
  function handleRequestDelete(meeting: Meeting) {
    closeModal();
    setConfirmDelete(meeting);
  }

  const deleteMutation = useMutation({
    mutationFn: (meetingId: string) => meetingApi.remove(meetingId),
    onSuccess: () => {
      showToast("Jadwal dihapus");
      setConfirmDelete(null);
      refresh();
    },
    onError: (err) => {
      setConfirmDelete(null);
      showToast(
        err instanceof ApiError ? err.message : "Gagal hapus jadwal",
        "error",
      );
    },
  });

  const sheetTitle =
    modal.view === "detail"
      ? "Detail Jadwal"
      : modal.view === "form"
        ? modal.mode === "create"
          ? "Buat Jadwal"
          : "Edit Jadwal"
        : "";

  return (
    <div className="px-4 py-4 space-y-4">
      {meetingsQuery.isLoading && <CalendarSkeleton />}

      <div className="bg-surface-card rounded-2xl border border-surface-border overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={idLocale}
          headerToolbar={{
            left: "prev",
            center: "title",
            right: "next",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={(arg) => {
            const from = arg.start.toISOString().slice(0, 10);
            const to = arg.end.toISOString().slice(0, 10);
            setRange((r) =>
              r.from === from && r.to === to ? r : { from, to },
            );
          }}
          height="auto"
          dayMaxEvents={3}
        />
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-soft/60 border border-accent/15">
        <Calendar size={14} className="text-accent flex-shrink-0 mt-0.5" />
        <p className="text-ios-caption text-accent/90 leading-relaxed">
          Tap tanggal untuk buat jadwal. Tap jadwal untuk lihat detail & edit.
        </p>
      </div>

      <AgendaList
        meetings={meetings}
        range={range}
        onSelect={(m) => setModal({ view: "detail", meeting: m })}
      />

      {/* Detail / Form Sheet */}
      <BottomSheet
        open={modal.view !== "closed"}
        onClose={closeModal}
        title={sheetTitle}
      >
        {modal.view === "detail" && (
          <MeetingDetailContent
            meeting={modal.meeting}
            onEdit={() =>
              setModal({ view: "form", mode: "edit", meeting: modal.meeting })
            }
            onRequestDelete={handleRequestDelete}
          />
        )}
        {modal.view === "form" && (
          <MeetingFormContent
            mode={modal.mode}
            meeting={modal.mode === "edit" ? modal.meeting : null}
            initialTanggal={modal.mode === "create" ? modal.tanggal : undefined}
            onClose={closeModal}
            onSaved={() => {
              const wasCreate =
                modal.view === "form" && modal.mode === "create";
              closeModal();
              refresh();
              showToast(wasCreate ? "Jadwal dibuat" : "Jadwal diperbarui");
            }}
          />
        )}
      </BottomSheet>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus jadwal ini?"
        description={
          confirmDelete
            ? `Jadwal "${confirmDelete.acara || "Pengajian"}" pada ${formatDateLongText(confirmDelete.tanggal)} akan dihapus permanen, BESERTA semua catatan absensi yang terkait. Tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        confirmLabel="Ya, Hapus"
        danger
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) deleteMutation.mutate(confirmDelete.meeting_id);
        }}
      />
    </div>
  );
}

/* ===================== Agenda List ===================== */

function AgendaList({
  meetings,
  range,
  onSelect,
}: {
  meetings: Meeting[];
  range: { from: string; to: string };
  onSelect: (m: Meeting) => void;
}) {
  const today = getTodayIso();

  const filtered = useMemo(() => {
    return meetings
      .filter((m) => m.tanggal >= range.from && m.tanggal <= range.to)
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [meetings, range]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-ios-footnote font-medium text-surface-muted">
          Agenda
        </p>
        <span className="text-ios-caption text-surface-muted tabular-nums">
          {filtered.length} jadwal
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-6 text-center">
          <Calendar size={20} className="text-surface-muted mx-auto mb-2" />
          <p className="text-ios-footnote text-surface-muted">
            Belum ada jadwal di periode ini
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
          {filtered.map((m, i) => {
            const isToday = m.tanggal === today;
            const targets = Array.isArray(m.kategori_target)
              ? (m.kategori_target as MemberCategory[])
              : [];

            return (
              <button
                key={m.meeting_id}
                onClick={() => onSelect(m)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-surface-card2 active:scale-[0.995] ${
                  i !== filtered.length - 1
                    ? "border-b border-surface-border"
                    : ""
                } ${isToday ? "bg-accent-soft/40" : ""}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                    isToday
                      ? "bg-accent text-white"
                      : "bg-surface-card2 text-surface-muted"
                  }`}
                >
                  <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
                    {m.hari.slice(0, 3)}
                  </span>
                  <span className="text-sm font-bold leading-none mt-0.5 tabular-nums">
                    {parseInt(m.tanggal.slice(8, 10), 10)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {m.acara || "Pengajian"}
                    </p>
                    {isToday && (
                      <span className="text-[9px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-1.5 py-0.5 uppercase flex-shrink-0">
                        Hari ini
                      </span>
                    )}
                  </div>
                  <p className="text-ios-caption text-surface-muted truncate">
                    {m.jam || "—"}
                    {m.group_id ? ` · ${m.group_id}` : ""}
                  </p>
                  {targets.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {targets.map((k) => (
                        <span
                          key={k}
                          className="text-[9px] font-semibold tracking-wide text-accent bg-accent-soft rounded-full px-1.5 py-0.5 uppercase"
                        >
                          {CATEGORY_LABEL[k]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <ChevronRight
                  size={14}
                  className="text-surface-muted flex-shrink-0"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===================== Detail ===================== */

function MeetingDetailContent({
  meeting,
  onEdit,
  onRequestDelete,
}: {
  meeting: Meeting;
  onEdit: () => void;
  onRequestDelete: (m: Meeting) => void;
}) {
  const targets = Array.isArray(meeting.kategori_target)
    ? (meeting.kategori_target as MemberCategory[])
    : [];

  return (
    <>
      <div className="mb-4 p-4 rounded-2xl bg-accent-soft/60 border border-accent/15">
        <p className="text-[11px] font-medium text-accent uppercase tracking-wide mb-1">
          {meeting.hari}
        </p>
        <p className="text-lg font-semibold text-surface-text mb-1">
          {meeting.acara || "Pengajian"}
        </p>
        <div className="flex items-center gap-3 text-ios-footnote text-surface-muted flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {formatDateLongText(meeting.tanggal)}
          </span>
          {meeting.jam && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {meeting.jam}
            </span>
          )}
        </div>
        {targets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {targets.map((k) => (
              <span
                key={k}
                className="text-[10px] font-semibold tracking-wide text-accent bg-surface-card rounded-full px-2 py-0.5 uppercase"
              >
                {CATEGORY_LABEL[k]}
              </span>
            ))}
          </div>
        )}
      </div>

      {meeting.materi && (
        <div className="mb-3">
          <p className="text-ios-caption text-surface-muted mb-1">Materi</p>
          <p className="text-ios-body text-surface-text">{meeting.materi}</p>
        </div>
      )}

      {meeting.catatan && (
        <div className="mb-3">
          <p className="text-ios-caption text-surface-muted mb-1">Catatan</p>
          <p className="text-ios-body text-surface-text">{meeting.catatan}</p>
        </div>
      )}

      <div className="space-y-2 mt-4">
        <Button fullWidth onClick={onEdit}>
          <span className="inline-flex items-center gap-1.5">
            <Pencil size={14} />
            Edit Jadwal
          </span>
        </Button>

        <button
          onClick={() => onRequestDelete(meeting)}
          className="w-full text-ios-body font-medium text-danger py-3 transition-colors hover:opacity-80 inline-flex items-center justify-center gap-1.5"
        >
          <Trash2 size={14} />
          Hapus Jadwal
        </button>
      </div>
    </>
  );
}

/* ===================== Form ===================== */

function MeetingFormContent({
  mode,
  meeting,
  initialTanggal,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  meeting: Meeting | null;
  initialTanggal?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const isEdit = mode === "edit";

  const [tanggal, setTanggal] = useState(
    initialTanggal || meeting?.tanggal || getTodayIso(),
  );
  const [jam, setJam] = useState(meeting?.jam || "Isya di tempat");
  const [groupId, setGroupId] = useState(meeting?.group_id || "");
  const [acara, setAcara] = useState(meeting?.acara || "Sambung Kelompok");
  const [kategoriTarget, setKategoriTarget] = useState<MemberCategory[]>(
    Array.isArray(meeting?.kategori_target)
      ? (meeting?.kategori_target as MemberCategory[])
      : [],
  );
  const [genderTarget, setGenderTarget] = useState<GenderTarget>(
    getGenderTarget(meeting),
  );
  const [sendReminder, setSendReminder] = useState(
    meeting?.send_reminder !== false,
  );

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        tanggal,
        jam,
        group_id: groupId,
        acara,
        kategori_target: kategoriTarget,
        gender_target: genderTarget,
        send_reminder: sendReminder,
      };
      if (isEdit && meeting) {
        return meetingApi.update({
          ...payload,
          meeting_id: meeting.meeting_id,
        });
      }
      return meetingApi.create(payload);
    },
    onSuccess: () => {
      onSaved();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "Gagal memperbarui"
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

      <Input
        label="Jam"
        value={jam}
        onChange={(e) => setJam(e.target.value)}
        placeholder="Isya di tempat"
      />

      <Input
        label="Acara"
        value={acara}
        onChange={(e) => setAcara(e.target.value)}
        placeholder="Sambung Kelompok"
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
                className={`px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all active:scale-[0.97] ${
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

      <ModernCheckbox
        checked={sendReminder}
        onChange={setSendReminder}
        label="Kirim Reminder WA"
        description="Kirim otomatis H-8 jam sebelum acara ke grup pengajian"
      />

      <Button
        fullWidth
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending
          ? "Menyimpan…"
          : isEdit
            ? "Simpan Perubahan"
            : "Buat Jadwal"}
      </Button>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Modern Checkbox                               */
/* -------------------------------------------------------------------------- */

function ModernCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 active:scale-[0.99] text-left ${
        checked
          ? "bg-accent-soft border-accent/40"
          : "bg-surface-card border-surface-border hover:bg-surface-card2"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-accent text-white"
            : "bg-surface-card2 border border-surface-border"
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ios-body font-medium text-surface-text">{label}</p>
        {description && (
          <p className="text-ios-caption text-surface-muted mt-0.5">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}
