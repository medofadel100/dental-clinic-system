"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

import RescheduleModal from "@/app/dashboard/appointments/RescheduleModal";

// Setup moment locale for Arabic
moment.locale("ar-eg");
const localizer = momentLocalizer(moment);

export default function CalendarView({
  initialEvents,
}: {
  initialEvents: any[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [view, setView] = useState<any>("week");
  const [date, setDate] = useState(new Date());
  const router = useRouter();

  const messages = {
    allDay: "طوال اليوم",
    previous: "السابق",
    next: "التالي",
    today: "اليوم",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    agenda: "أجندة",
    date: "تاريخ",
    time: "وقت",
    event: "حدث",
    noEventsInRange: "لا يوجد مواعيد في هذه الفترة.",
  };

  const handleSelectSlot = (slotInfo: any) => {
    // In a real app, this would open a modal to add an appointment
    // alert(`هل تريد إضافة موعد في ${moment(slotInfo.start).format('LLLL')}؟`);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  return (
    <div
      style={{
        height: "700px",
        width: "100%",
        direction: "rtl",
        padding: "1rem",
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        culture="ar-eg"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        defaultView="week"
        view={view}
        onView={(v) => setView(v)}
        date={date}
        onNavigate={(d) => setDate(d)}
        views={["month", "week", "day", "agenda"]}
        rtl={true}
        eventPropGetter={(event) => {
          let backgroundColor = "var(--primary)";
          if (event.status === "Completed") backgroundColor = "var(--success)";
          if (event.status === "Cancelled") backgroundColor = "var(--error)";
          return {
            style: {
              backgroundColor,
              borderRadius: "8px",
              border: "none",
              padding: "4px",
              fontSize: "0.875rem",
              fontWeight: 600,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
          };
        }}
      />
      {selectedEvent && (
        <RescheduleModal
          appointment={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
