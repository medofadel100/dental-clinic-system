import styles from "./patient.module.css";
import { createClient } from "@/utils/supabase/server";

import FinancialSummary from "./FinancialSummary";
import MediaGallery from "./MediaGallery";

import EditProfileModal from "./EditProfileModal";

export default async function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!patient) return null;

  let ageString = 'غير مسجل';
  if (patient.date_of_birth) {
    const dob = new Date(patient.date_of_birth);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    ageString = `${age} سنة`;
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", resolvedParams.id)
    .order("created_at", { ascending: false });

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*, profiles(full_name)")
    .eq("patient_id", resolvedParams.id)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true })
    .limit(3);

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>البيانات الأساسية</h3>
          <EditProfileModal patient={patient} />
        </div>
        <ul className={styles.infoList}>
          <li>
            <strong>تاريخ الميلاد:</strong>
            <span>
              {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('ar-EG') : 'غير مسجل'}
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginRight: '0.5rem' }}>({ageString})</span>
            </span>
          </li>
          <li>
            <strong>تاريخ التسجيل:</strong>
            <span>{new Date(patient.created_at).toLocaleDateString('ar-EG')}</span>
          </li>
        </ul>
      </div>

      <div className={styles.card}>
        <h3>التاريخ المرضي</h3>
        {patient.medical_history ? (
          <ul style={{ paddingRight: '1.5rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {patient.medical_history.split('\n').filter((line: string) => line.trim() !== '').map((line: string, index: number) => (
              <li key={index}>{line.replace(/^- /, '')}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.placeholderText}>لا يوجد تاريخ مرضي مسجل.</p>
        )}
      </div>

      <div className={styles.card}>
        <h3>صور الأشعة والملفات</h3>
        <MediaGallery patientId={patient.id} />
      </div>

      <div className={styles.card}>
        <h3>المواعيد القادمة</h3>
        {(!upcomingAppointments || upcomingAppointments.length === 0) ? (
          <p className={styles.placeholderText}>لا يوجد مواعيد قادمة.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingAppointments.map((appt: any) => (
              <div key={appt.id} style={{ 
                padding: '0.75rem', backgroundColor: 'var(--bg-main)', 
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {new Date(appt.appointment_date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(appt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                  د. {appt.profiles?.full_name || 'طبيب عام'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FinancialSummary patientId={patient.id} initialInvoices={invoices || []} />
    </div>
  );
}
