import { createClient } from "@/utils/supabase/server";
import { Users, Stethoscope, UserCog, UserPlus } from "lucide-react";
import Link from "next/link";
import styles from "../financials/financials.module.css";
import { updateSalary } from "./actions";

export default async function StaffPage() {
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!staff) return <p>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>فريق العمل وإدارة الرواتب</h1>
        <Link href="/dashboard/staff/new" className={styles.primaryBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} />
          إضافة موظف جديد
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {staff.map((member) => (
          <div key={member.id} className={styles.detailsCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {member.role === 'Doctor' ? <Stethoscope size={24} /> : <UserCog size={24} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{member.full_name}</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {member.role === 'Doctor' ? 'طبيب' : member.role === 'Receptionist' ? 'استقبال' : 'مدير'}
                  </span>
                </div>
              </div>
            </div>

            <form action={updateSalary} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <input type="hidden" name="profileId" value={member.id} />
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: '1 1 200px' }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>نظام الراتب</label>
                  <select name="salary_system" defaultValue={member.salary_system || "Fixed"} style={{
                    padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", fontFamily: "inherit"
                  }}>
                    <option value="Fixed">راتب ثابت فقط</option>
                    <option value="Percentage">نسبة مئوية فقط</option>
                    <option value="Both">ثابت + نسبة</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: '1 1 200px' }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الراتب الثابت (ج.م)</label>
                  <input type="number" name="salary_value" defaultValue={member.salary_value || 0} required step="0.01" style={{
                    padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", fontFamily: "inherit"
                  }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: '1 1 200px' }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>نسبة الطبيب (%)</label>
                  <input type="number" name="percentage_value" defaultValue={member.percentage_value || 0} required step="0.01" style={{
                    padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", fontFamily: "inherit"
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: '1 1 200px' }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: 'var(--success)' }}>مكافآت وإضافات (ج.م)</label>
                  <input type="number" name="bonus_amount" defaultValue={member.bonus_amount || 0} required step="0.01" style={{
                    padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--success)",
                    backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", fontFamily: "inherit"
                  }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: '1 1 200px' }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: 'var(--error)' }}>خصومات وسلف (ج.م)</label>
                  <input type="number" name="deduction_amount" defaultValue={member.deduction_amount || 0} required step="0.01" style={{
                    padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--error)",
                    backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", fontFamily: "inherit"
                  }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', flex: '1 1 200px' }}>
                  <button type="submit" style={{
                    backgroundColor: "var(--primary)", color: "white", border: "none", width: '100%',
                    padding: "0.6rem 1.5rem", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600
                  }}>
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
