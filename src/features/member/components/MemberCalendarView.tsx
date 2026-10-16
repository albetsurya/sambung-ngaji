import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import idLocale from "@fullcalendar/core/locales/id";
import type { EventClickArg } from "@fullcalendar/core/index.js";
import type { Meeting } from "../../../types";

export function MemberCalendarView({
  meetings,
  onSelect,
}: {
  meetings: Meeting[];
  onSelect: (m: Meeting) => void;
}) {
  const events = useMemo(
    () =>
      meetings.map((m) => ({
        id: m.meeting_id,
        title: m.event || "Pengajian",
        date: m.date,
        extendedProps: { meeting: m },
      })),
    [meetings],
  );

  function handleEventClick(arg: EventClickArg) {
    const meeting = arg.event.extendedProps.meeting as Meeting;
    onSelect(meeting);
  }

  return (
    <div className="bg-surface-card rounded-2xl border border-surface-border overflow-hidden">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={idLocale}
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        dayMaxEvents={2}
        eventDisplay="block"
        fixedWeekCount={false}
      />
    </div>
  );
}
