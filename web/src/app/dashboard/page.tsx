import styles from "./dashboard.module.css";
import { Users, Calendar, AlertCircle, Stethoscope } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardOverview() {
  const supabase = await createClient();

  // 1. Get today's appointments
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const { data: todayAppts } = await supabase
    .from('appointments')
    .select('id, appointment_date, status, patients(full_name)')
    .gte('appointment_date', todayStart.toISOString())
    .lt('appointment_date', todayEnd.toISOString())
    .order('appointment_date', { ascending: true });

  const appointmentsCount = todayAppts?.length || 0;

  // 2. Get total patients count
  const { count: patientsCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  // 3. Get total doctors
  const { count: doctorsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_doctor', true);

  // 4. Get low stock inventory items
  const { data: inventoryItems } = await supabase.from('inventory').select('item_name, quantity, minimum_stock_level');
  const lowStockItems = inventoryItems?.filter(item => item.quantity <= item.minimum_stock_level) || [];
  const lowStockCount = lowStockItems.length;

  // 5. Get pending tasks (Unpaid invoices and Scheduled appointments)
  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('id, amount_due, amount_paid, status, created_at, patients(full_name)')
    .in('status', ['Unpaid', 'Partial'])
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: pendingAppts } = await supabase
    .from('appointments')
    .select('id, appointment_date, patients(full_name)')
    .eq('status', 'Scheduled')
    .gte('appointment_date', todayStart.toISOString())
    .order('appointment_date', { ascending: true })
    .limit(3);

  const tasks: any[] = [];
  if (pendingInvoices) {
    pendingInvoices.forEach(inv => {
      tasks.push({
        id: `inv_${inv.id}`,
        type: 'invoice',
        title: `تحصيل فاتورة: ${(inv.patients as any)?.full_name}`,
        subtitle: `المبلغ المتبقي: ${inv.amount_due - inv.amount_paid} ج.م`,
        date: new Date(inv.created_at)
      });
    });
  }
  if (pendingAppts) {
    pendingAppts.forEach(appt => {
      tasks.push({
        id: `appt_${appt.id}`,
        type: 'appointment',
        title: `تأكيد موعد: ${(appt.patients as any)?.full_name}`,
        subtitle: `موعد الحجز: ${new Date(appt.appointment_date).toLocaleString('ar-EG', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`,
        date: new Date(appt.appointment_date)
      });
    });
  }

  // Sort tasks by date (closest to today first)
  tasks.sort((a, b) => Math.abs(a.date.getTime() - Date.now()) - Math.abs(b.date.getTime() - Date.now()));
  const topTasks = tasks.slice(0, 5);

  return (
    <div className={styles.overview}>
      <h1 className={styles.pageTitle}>نظرة عامة</h1>
      
      {lowStockCount > 0 && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)',
          padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'flex-start'
        }}>
          <AlertCircle size={24} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: 'var(--error)', margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>تنبيه: نواقص في المخزن الطبي!</h3>
            <ul style={{ margin: 0, paddingRight: '1.5rem', color: 'var(--error)' }}>
              {lowStockItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                  <strong>{item.item_name}</strong> - الكمية الحالية: {item.quantity} (الحد الأدنى: {item.minimum_stock_level})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Link href="/dashboard/appointments" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.statCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
              <Calendar size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>كشوفات اليوم</span>
              <span className={styles.statValue}>{appointmentsCount}</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/patients" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.statCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: "rgba(2, 132, 199, 0.1)", color: "var(--primary)" }}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>إجمالي المرضى</span>
              <span className={styles.statValue}>{patientsCount || 0}</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/staff" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.statCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary)" }}>
              <Stethoscope size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>عدد الأطباء</span>
              <span className={styles.statValue}>{doctorsCount || 0}</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.statCard} style={{ border: lowStockCount > 0 ? '1px solid var(--error)' : 'none', cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: lowStockCount > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: lowStockCount > 0 ? "var(--error)" : "var(--success)" }}>
              <AlertCircle size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>نواقص المخزن</span>
              <span className={styles.statValue} style={{ color: lowStockCount > 0 ? 'var(--error)' : 'inherit' }}>{lowStockCount} عناصر</span>
            </div>
          </div>
        </Link>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>مواعيد اليوم</h3>
          {todayAppts && todayAppts.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todayAppts.map(appt => (
                <li key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{(appt.patients as any)?.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{appt.status === 'Scheduled' ? 'مجدول' : appt.status}</span>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {new Date(appt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.placeholderText} style={{ marginTop: '1rem' }}>لا يوجد مواعيد مسجلة اليوم.</p>
          )}
        </div>
        <div className={styles.chartCard}>
          <h3>مهام النظام المعلقة</h3>
          {topTasks.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topTasks.map(task => (
                <li key={task.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '0.75rem', 
                  backgroundColor: task.type === 'invoice' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(59, 130, 246, 0.05)', 
                  borderRadius: 'var(--radius-md)', border: `1px solid ${task.type === 'invoice' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  borderRight: `4px solid ${task.type === 'invoice' ? 'var(--error)' : 'var(--primary)'}`
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.subtitle}</span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 600,
                    backgroundColor: task.type === 'invoice' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: task.type === 'invoice' ? 'var(--error)' : 'var(--primary)',
                    padding: '0.25rem 0.5rem', borderRadius: '4px', height: 'fit-content'
                  }}>
                    {task.type === 'invoice' ? 'مستحقات' : 'مواعيد'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.placeholderText} style={{ marginTop: '1rem' }}>لا توجد مهام معلقة! النظام محدث بالكامل.</p>
          )}
        </div>
      </div>
    </div>
  );
}
