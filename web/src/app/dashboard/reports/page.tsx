import { createClient } from "@/utils/supabase/server";
import { Activity, Stethoscope, DollarSign, Users } from "lucide-react";
import styles from "../financials/financials.module.css";

export default async function ReportsPage() {
  const supabase = await createClient();

  // Fetch doctors
  const { data: doctors } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "Doctor");

  // Fetch treatment plans with sessions to calculate revenue per doctor
  const { data: plans } = await supabase.from("treatment_plans").select(`
      doctor_id,
      patient_id,
      sessions (
        session_cost
      )
    `);

  if (!doctors) return <p>جاري التحميل...</p>;

  // Calculate stats per doctor
  const doctorStats = doctors.map((doctor) => {
    const doctorPlans = plans?.filter((p) => p.doctor_id === doctor.id) || [];

    // Unique patients treated by this doctor
    const uniquePatients = new Set(doctorPlans.map((p) => p.patient_id)).size;

    // Total revenue from sessions
    const totalRevenue = doctorPlans.reduce((total, plan) => {
      const planSessions = plan.sessions || [];
      const planRevenue = planSessions.reduce(
        (sum: number, session: any) => sum + Number(session.session_cost || 0),
        0,
      );
      return total + planRevenue;
    }, 0);

    // Calculate Salary
    let calculatedSalary = 0;
    if (doctor.salary_type === "Fixed") {
      calculatedSalary = Number(doctor.salary_value || 0);
    } else if (doctor.salary_type === "Percentage") {
      calculatedSalary =
        totalRevenue * (Number(doctor.salary_value || 0) / 100);
    }

    return {
      ...doctor,
      uniquePatients,
      totalRevenue,
      calculatedSalary,
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>تقارير أداء الأطباء</h1>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        {doctorStats.map((stat) => (
          <div key={stat.id} className={styles.detailsCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(14, 165, 233, 0.1)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stethoscope size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                  {stat.full_name}
                </h3>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  النظام المالي:{" "}
                  {stat.salary_type === "Fixed" ? "راتب ثابت" : "نسبة مئوية"}(
                  {stat.salary_value || 0}
                  {stat.salary_type === "Percentage" ? "%" : " ج.م"})
                </span>
              </div>
            </div>

            <div
              className={styles.statsGrid}
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <div className={styles.statCard} style={{ padding: "1rem" }}>
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "var(--success)",
                    width: "36px",
                    height: "36px",
                  }}
                >
                  <Users size={18} />
                </div>
                <div className={styles.statInfo}>
                  <span
                    className={styles.statLabel}
                    style={{ fontSize: "0.75rem" }}
                  >
                    الحالات المُعالجة
                  </span>
                  <span
                    className={styles.statValue}
                    style={{ fontSize: "1.25rem" }}
                  >
                    {stat.uniquePatients} مريض
                  </span>
                </div>
              </div>

              <div className={styles.statCard} style={{ padding: "1rem" }}>
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: "rgba(14, 165, 233, 0.1)",
                    color: "var(--primary)",
                    width: "36px",
                    height: "36px",
                  }}
                >
                  <Activity size={18} />
                </div>
                <div className={styles.statInfo}>
                  <span
                    className={styles.statLabel}
                    style={{ fontSize: "0.75rem" }}
                  >
                    إجمالي شغل الطبيب
                  </span>
                  <span
                    className={styles.statValue}
                    style={{ fontSize: "1.25rem" }}
                  >
                    {stat.totalRevenue.toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              <div
                className={styles.statCard}
                style={{ padding: "1rem", border: "2px solid var(--primary)" }}
              >
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "white",
                    width: "36px",
                    height: "36px",
                  }}
                >
                  <DollarSign size={18} />
                </div>
                <div className={styles.statInfo}>
                  <span
                    className={styles.statLabel}
                    style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    الراتب / المستحقات
                  </span>
                  <span
                    className={styles.statValue}
                    style={{ fontSize: "1.25rem", color: "var(--primary)" }}
                  >
                    {stat.calculatedSalary.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {doctorStats.length === 0 && (
          <p className={styles.placeholderText}>
            لا يوجد أطباء مسجلين في النظام بعد.
          </p>
        )}
      </div>
    </div>
  );
}
