import { createClient } from "@/utils/supabase/server";
import styles from "../../financials/financials.module.css";
import { ArrowRight, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { addAppointment } from "../actions";
import PatientSelect from "./PatientSelect";

export default async function NewAppointmentPage() {
  const supabase = await createClient();

  // Fetch all patients for the dropdown
  const { data: patients } = await supabase.from('patients').select('id, full_name, phone').order('full_name');
  
  // Fetch doctors for the dropdown
  const { data: doctors } = await supabase.from('profiles').select('id, full_name').eq('is_doctor', true).order('full_name');

  // Fetch services for the dropdown
  const { data: services } = await supabase.from('services_catalog').select('id, name, base_price').order('name');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/appointments" style={{
            padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', textDecoration: 'none'
          }}>
            <ArrowRight size={20} />
          </Link>
          <h1 className={styles.pageTitle}>حجز موعد جديد</h1>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', maxWidth: '600px', margin: '0 auto' }}>
        <form action={addAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <PatientSelect patients={patients || []} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>الطبيب المعالج</label>
            <select name="doctor_id" style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }}>
              <option value="">أي طبيب متاح (توزيع تلقائي)</option>
              {doctors?.map(d => (
                <option key={d.id} value={d.id}>د. {d.full_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>الخدمة المطلوبة (مبدئياً)</label>
            <select name="service_id" style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }}>
              <option value="">غير محدد</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.name} (يبدأ من {s.base_price} ج.م)</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>تاريخ ووقت الموعد</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <input type="checkbox" id="is_walk_in" name="is_walk_in" value="true" />
              <label htmlFor="is_walk_in" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>دخول الآن (Walk-In)</label>
            </div>
            <input type="datetime-local" name="appointment_date" style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ملاحظات إضافية (اختياري)</label>
            <textarea name="notes" rows={3} placeholder="أي تفاصيل عن الحالة..." style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', resize: 'vertical'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <Link href="/dashboard/appointments" style={{
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500
            }}>إلغاء</Link>
            <button type="submit" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600
            }}>
              <CalendarPlus size={20} />
              تأكيد الحجز
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
