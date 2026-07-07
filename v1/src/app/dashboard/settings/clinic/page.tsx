import styles from "../../financials/financials.module.css";
import { ArrowRight, Save, Building2, Clock } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function ClinicSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('clinic_settings').select('*').limit(1).single();

  async function saveClinicInfo(formData: FormData) {
    'use server'
    const supabase = await createClient();
    
    const updates = {
      clinic_name: formData.get("clinic_name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      slot_duration: parseInt(formData.get("slot_duration") as string)
    };

    if (settings?.id) {
      await supabase.from('clinic_settings').update(updates).eq('id', settings.id);
    } else {
      await supabase.from('clinic_settings').insert(updates);
    }

    revalidatePath('/dashboard/settings/clinic');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/settings" className={styles.secondaryBtn} style={{ padding: "0.5rem" }}>
            <ArrowRight size={24} />
          </Link>
          <h1 className={styles.pageTitle}>الملف الشخصي للعيادة</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div className={styles.detailsCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--primary)" }}>
            <Building2 size={24} />
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>بيانات العيادة الأساسية</h2>
          </div>
          
          <form action={saveClinicInfo} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>اسم العيادة</label>
              <input type="text" name="clinic_name" defaultValue={settings?.clinic_name || "لومينا ديجيتال"} required style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
              }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>رقم هاتف الاستقبال</label>
              <input type="text" name="phone" defaultValue={settings?.phone || "01012345678"} style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
              }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>عنوان العيادة</label>
              <textarea name="address" defaultValue={settings?.address || "القاهرة، مدينة نصر"} rows={2} style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit", resize: "vertical"
              }}></textarea>
            </div>

            <button type="submit" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", 
              backgroundColor: "var(--primary)", color: "white", 
              border: "none", padding: "0.875rem", borderRadius: "var(--radius-md)", 
              cursor: "pointer", fontFamily: "inherit", fontWeight: 600, marginTop: "1rem"
            }}>
              <Save size={20} />
              <span>حفظ التعديلات</span>
            </button>
          </form>
        </div>

        <div className={styles.detailsCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--primary)" }}>
            <Clock size={24} />
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>مواعيد العمل</h2>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            هذه المواعيد يستخدمها المساعد الذكي (الشات بوت) لعرض الأوقات المتاحة للحجز للمرضى تلقائياً.
          </p>

          <form action={saveClinicInfo} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>بداية العمل</label>
                <input type="time" name="start_time" defaultValue={settings?.start_time ? settings.start_time.slice(0, 5) : "10:00"} style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>نهاية العمل</label>
                <input type="time" name="end_time" defaultValue={settings?.end_time ? settings.end_time.slice(0, 5) : "22:00"} style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
                }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>مدة الكشف (بالدقائق)</label>
              <input type="number" name="slot_duration" defaultValue={settings?.slot_duration || 30} style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
              }} />
            </div>

            <button type="submit" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", 
              backgroundColor: "var(--primary)", color: "white", 
              border: "none", padding: "0.875rem", borderRadius: "var(--radius-md)", 
              cursor: "pointer", fontFamily: "inherit", fontWeight: 600, marginTop: "auto"
            }}>
              <Save size={20} />
              <span>حفظ المواعيد</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
