import { createClient } from "@/utils/supabase/server";
import styles from "../patient.module.css";
import { Plus } from "lucide-react";
import { addSession } from "./actions";

export default async function SessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch Services Catalog
  const { data: services } = await supabase.from('services_catalog').select('*').order('name');

  // Fetch Past Sessions with service details
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      services_catalog (name, base_price)
    `)
    .eq('patient_id', resolvedParams.id)
    .order('created_at', { ascending: false });

  // Fetch Pending Appointments (Scheduled or Confirmed)
  const { data: pendingAppointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', resolvedParams.id)
    .in('status', ['Scheduled', 'Confirmed'])
    .order('appointment_date', { ascending: true });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      
      {/* Create Session Form */}
      <div className={styles.card} style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.125rem' }}>
          <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          جلسة جديدة (الفحص / العلاج)
        </h3>
        
        <form action={addSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="patient_id" value={resolvedParams.id} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>تحديد الموعد (اختياري ولكن يُفضل)</label>
            <select name="appointment_id" style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }}>
              <option value="">-- جلسة بدون موعد مسبق --</option>
              {pendingAppointments?.map(appt => (
                <option key={appt.id} value={appt.id}>
                  موعد: {new Date(appt.appointment_date).toLocaleString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>نوع الخدمة المقدمة</label>
            <select name="service_id" required style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }}>
              <option value="">اختر الخدمة...</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.base_price} ج.م)</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>نوع الخصم</label>
              <select name="discount_type" style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
              }}>
                <option value="">بدون خصم</option>
                <option value="Fixed">مبلغ ثابت (ج.م)</option>
                <option value="Percentage">نسبة مئوية (%)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>قيمة الخصم</label>
              <input type="number" name="discount_value" min="0" step="0.01" defaultValue="0" style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ملاحظات الجلسة للـ (Re-check)</label>
            <textarea name="notes" rows={3} style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', resize: 'vertical'
            }}></textarea>
          </div>

          <button type="submit" style={{
            padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem'
          }}>
            حفظ الجلسة وإصدار الفاتورة
          </button>
        </form>
      </div>

      {/* History */}
      <div className={styles.card}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.125rem' }}>تاريخ الجلسات والفواتير</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>لا يوجد جلسات مسجلة.</p>
          ) : (
            sessions?.map(s => (
              <div key={s.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.services_catalog?.name || 'خدمة غير مسماة'}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(s.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {s.discount_value > 0 ? (
                      <span style={{ color: 'var(--error)' }}>
                        (خصم {s.discount_value}{s.discount_type === 'Percentage' ? '%' : ' ج.م'})
                      </span>
                    ) : 'بدون خصم'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>التكلفة: {s.session_cost} ج.م</span>
                </div>
                {s.notes && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)' }}>
                    ملاحظات: {s.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
