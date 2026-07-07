import styles from "./dashboard.module.css";
import { LayoutDashboard, Users, Calendar, Stethoscope, Settings, LogOut, Activity, Package, Megaphone } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "../login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'Receptionist';
  const isAdmin = role === 'Admin';
  const isDoctor = role === 'Doctor';

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Activity className={styles.logoIcon} />
          <span>لومينا ديجيتال</span>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/dashboard" className={styles.navItem}>
            <LayoutDashboard size={20} />
            <span>الرئيسية</span>
          </Link>
          <Link href="/dashboard/appointments" className={styles.navItem}>
            <Calendar size={20} />
            <span>المواعيد</span>
          </Link>
          <Link href="/dashboard/queue" className={styles.navItem}>
            <Activity size={20} />
            <span>طابور اليوم</span>
          </Link>
          <Link href="/dashboard/patients" className={styles.navItem}>
            <Users size={20} />
            <span>المرضى</span>
          </Link>

          {(isAdmin || isDoctor) && (
            <Link href="/dashboard/inventory" className={styles.navItem}>
              <Package size={20} />
              <span>المخزن الطبي</span>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link href="/dashboard/financials" className={styles.navItem}>
                <Activity size={20} />
                <span>الحسابات المالية</span>
              </Link>
              <div className={styles.subMenu} style={{ paddingRight: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
                <Link href="/dashboard/financials/income" className={styles.subNavItem} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>الإيرادات</Link>
                <Link href="/dashboard/financials/expenses" className={styles.subNavItem} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>المصروفات</Link>
                <Link href="/dashboard/financials/installments" className={styles.subNavItem} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>الأقساط والدفعات</Link>
                <Link href="/dashboard/financials/salaries" className={styles.subNavItem} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>الرواتب</Link>
                <Link href="/dashboard/financials/reports" className={styles.subNavItem} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>التقارير المالية</Link>
              </div>

              <Link href="/dashboard/staff" className={styles.navItem}>
                <Users size={20} />
                <span>فريق العمل</span>
              </Link>
              <Link href="/dashboard/reports" className={styles.navItem}>
                <Activity size={20} />
                <span>التقارير والإحصائيات</span>
              </Link>
              <Link href="/dashboard/marketing" className={styles.navItem}>
                <Megaphone size={20} />
                <span>التسويق والإشعارات</span>
              </Link>
            </>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          {isAdmin && (
            <Link href="/dashboard/settings" className={styles.navItem}>
              <Settings size={20} />
              <span>الإعدادات</span>
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className={`${styles.navItem} ${styles.logoutBtn}`}>
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Top Navbar */}
        <header className={styles.topNav}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>د</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>د. أحمد</span>
              <span className={styles.userRole}>مدير العيادة</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
