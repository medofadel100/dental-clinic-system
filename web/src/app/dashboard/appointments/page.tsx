import { createClient } from "@/utils/supabase/server";
import dynamic from 'next/dynamic';
const CalendarView = dynamic(() => import("@/components/CalendarView"), { ssr: false });
import styles from "./appointments.module.css";
import { Plus } from "lucide-react";

import Link from "next/link";
import { Filter } from "lucide-react";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const filterDoctorId = resolvedParams.doctorId;
  const filterSearch = resolvedParams.search;

  const supabase = await createClient();

  // Fetch doctors for the filter dropdown
  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_doctor", true)
    .order("full_name");

  // Fetch appointments with patient and doctor details
  let query = supabase.from("appointments").select(`
      id, 
      appointment_date, 
      status, 
      patient_id,
      doctor_id,
      patients (full_name, phone),
      profiles (full_name)
    `);

  if (filterDoctorId) {
    query = query.eq("doctor_id", filterDoctorId);
  }

  if (filterSearch) {
    const { data: matchedPatients } = await supabase
      .from("patients")
      .select("id")
      .or(`full_name.ilike.%${filterSearch}%,phone.ilike.%${filterSearch}%`);

    if (matchedPatients && matchedPatients.length > 0) {
      query = query.in(
        "patient_id",
        matchedPatients.map((p) => p.id),
      );
    } else {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000"); // return none
    }
  }

  const { data: appointments } = await query;

  // Transform data for the calendar
  const events =
    appointments?.map((appt: any) => {
      const startDate = new Date(appt.appointment_date);
      // Assuming a standard 30 min appointment if not specified
      const endDate = new Date(startDate.getTime() + 30 * 60000);

      const doctorName = appt.profiles
        ? `د. ${appt.profiles.full_name}`
        : "أي طبيب";

      return {
        id: appt.id,
        title: `${appt.patients?.full_name} (${doctorName})`,
        start: startDate,
        end: endDate,
        patientId: appt.patient_id,
        status: appt.status,
        patients: appt.patients,
        appointment_date: appt.appointment_date,
      };
    }) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <h1 className={styles.pageTitle}>جدول المواعيد</h1>

          <form
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--bg-surface)",
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <Filter size={16} color="var(--text-secondary)" />
            <input
              type="text"
              name="search"
              placeholder="بحث بالاسم أو الهاتف..."
              defaultValue={filterSearch || ""}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.875rem",
                width: "150px",
              }}
            />
            <div
              style={{
                width: "1px",
                height: "20px",
                backgroundColor: "var(--border)",
              }}
            ></div>
            <select
              name="doctorId"
              defaultValue={filterDoctorId || ""}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.875rem",
              }}
            >
              <option value="">جميع الأطباء</option>
              {doctors?.map((d) => (
                <option key={d.id} value={d.id}>
                  د. {d.full_name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "var(--bg-main)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              بحث وتصفية
            </button>
          </form>
        </div>

        <Link
          href="/dashboard/appointments/new"
          className={styles.primaryBtn}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plus size={18} />
          <span>حجز موعد جديد</span>
        </Link>
      </div>

      <div className={styles.calendarCard}>
        <CalendarView initialEvents={events} />
      </div>
    </div>
  );
}
