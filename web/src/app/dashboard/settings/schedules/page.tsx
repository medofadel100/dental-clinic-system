import styles from "../../financials/financials.module.css";
import { ArrowRight, Save, Clock, User } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const DAYS_OF_WEEK = [
  { id: 0, name: "الأحد" },
  { id: 1, name: "الإثنين" },
  { id: 2, name: "الثلاثاء" },
  { id: 3, name: "الأربعاء" },
  { id: 4, name: "الخميس" },
  { id: 5, name: "الجمعة" },
  { id: 6, name: "السبت" },
];

export default async function SchedulesSettingsPage() {
  const supabase = await createClient();

  // Fetch doctors
  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "Doctor")
    .order("full_name");

  // Fetch their schedules
  const { data: schedules } = await supabase
    .from("doctor_schedules")
    .select("*")
    .order("day_of_week");

  async function saveSchedule(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const doctor_id = formData.get("doctor_id") as string;
    const day_of_week = parseInt(formData.get("day_of_week") as string);
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const is_active = formData.get("is_active") === "true";

    // Upsert the schedule
    const { data: existing } = await supabase
      .from("doctor_schedules")
      .select("id")
      .eq("doctor_id", doctor_id)
      .eq("day_of_week", day_of_week)
      .single();

    if (existing) {
      await supabase
        .from("doctor_schedules")
        .update({
          start_time,
          end_time,
          is_active,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("doctor_schedules").insert({
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        is_active,
      });
    }

    revalidatePath("/dashboard/settings/schedules");
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/dashboard/settings"
            className={styles.secondaryBtn}
            style={{ padding: "0.5rem" }}
          >
            <ArrowRight size={24} />
          </Link>
          <h1 className={styles.pageTitle}>جداول عمل الأطباء</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {doctors?.map((doc) => (
          <div key={doc.id} className={styles.detailsCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                color: "var(--primary)",
              }}
            >
              <User size={24} />
              <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>
                د. {doc.full_name}
              </h2>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "right",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  <th style={{ padding: "0.5rem" }}>اليوم</th>
                  <th style={{ padding: "0.5rem" }}>من الساعة</th>
                  <th style={{ padding: "0.5rem" }}>إلى الساعة</th>
                  <th style={{ padding: "0.5rem" }}>الحالة</th>
                  <th style={{ padding: "0.5rem" }}>تحديث</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map((day) => {
                  const currentSchedule = schedules?.find(
                    (s) => s.doctor_id === doc.id && s.day_of_week === day.id,
                  );
                  return (
                    <tr
                      key={day.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td style={{ padding: "1rem 0.5rem" }}>{day.name}</td>
                      <td style={{ padding: "1rem 0.5rem" }}>
                        <form
                          id={`form-${doc.id}-${day.id}`}
                          action={saveSchedule}
                          style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="hidden"
                            name="doctor_id"
                            value={doc.id}
                          />
                          <input
                            type="hidden"
                            name="day_of_week"
                            value={day.id}
                          />
                          <input
                            type="time"
                            name="start_time"
                            defaultValue={
                              currentSchedule?.start_time?.slice(0, 5) ||
                              "10:00"
                            }
                            style={{
                              padding: "0.5rem",
                              borderRadius: "0.25rem",
                              border: "1px solid var(--border)",
                            }}
                          />
                        </form>
                      </td>
                      <td style={{ padding: "1rem 0.5rem" }}>
                        <input
                          type="time"
                          name="end_time"
                          form={`form-${doc.id}-${day.id}`}
                          defaultValue={
                            currentSchedule?.end_time?.slice(0, 5) || "22:00"
                          }
                          style={{
                            padding: "0.5rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border)",
                          }}
                        />
                      </td>
                      <td style={{ padding: "1rem 0.5rem" }}>
                        <select
                          name="is_active"
                          form={`form-${doc.id}-${day.id}`}
                          defaultValue={
                            currentSchedule?.is_active === false
                              ? "false"
                              : "true"
                          }
                          style={{
                            padding: "0.5rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <option value="true">عمل</option>
                          <option value="false">إجازة</option>
                        </select>
                      </td>
                      <td style={{ padding: "1rem 0.5rem" }}>
                        <button
                          type="submit"
                          form={`form-${doc.id}-${day.id}`}
                          className={styles.primaryBtn}
                          style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          <Save size={16} /> حفظ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
