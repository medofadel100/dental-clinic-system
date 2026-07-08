"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  Package,
  Megaphone,
  Banknote,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import styles from "./dashboard.module.css";
import { logout } from "../login/actions";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  subItems?: { href: string; label: string }[];
}

interface MobileSidebarProps {
  isAdmin: boolean;
  isDoctor: boolean;
  profileName: string;
  role: string;
}

export default function MobileSidebar({
  isAdmin,
  isDoctor,
  profileName,
  role,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [financialsOpen, setFinancialsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const roleLabel =
    role === "Admin"
      ? "مدير النظام"
      : role === "Doctor"
        ? "طبيب"
        : "موظف استقبال";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className={styles.mobileTopBar}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsOpen(true)}
          aria-label="فتح القائمة"
        >
          <Menu size={24} />
        </button>
        <div className={styles.mobileLogo}>
          <Activity size={20} />
          <span>لومينا ديجيتال</span>
        </div>
        <div className={styles.mobileAvatar}>
          {profileName ? profileName.charAt(0).toUpperCase() : "د"}
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Sidebar */}
      <aside
        className={`${styles.mobileSidebar} ${isOpen ? styles.mobileSidebarOpen : ""}`}
      >
        {/* Sidebar Header */}
        <div className={styles.mobileSidebarHeader}>
          <div className={styles.mobileSidebarLogo}>
            <Activity size={22} />
            <span>لومينا ديجيتال</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={22} />
          </button>
        </div>

        {/* User Info */}
        <div className={styles.mobileSidebarUser}>
          <div className={styles.mobileSidebarAvatar}>
            {profileName ? profileName.charAt(0).toUpperCase() : "د"}
          </div>
          <div>
            <div className={styles.mobileSidebarUserName}>
              {profileName || "مستخدم"}
            </div>
            <div className={styles.mobileSidebarUserRole}>{roleLabel}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className={styles.mobileSidebarNav}>
          <Link
            href="/dashboard"
            className={`${styles.mobileSidebarLink} ${isActive("/dashboard") ? styles.mobileSidebarLinkActive : ""}`}
          >
            <LayoutDashboard size={20} />
            <span>الرئيسية</span>
          </Link>

          <Link
            href="/dashboard/appointments"
            className={`${styles.mobileSidebarLink} ${isActive("/dashboard/appointments") ? styles.mobileSidebarLinkActive : ""}`}
          >
            <Calendar size={20} />
            <span>المواعيد</span>
          </Link>

          <Link
            href="/dashboard/queue"
            className={`${styles.mobileSidebarLink} ${isActive("/dashboard/queue") ? styles.mobileSidebarLinkActive : ""}`}
          >
            <Activity size={20} />
            <span>طابور اليوم</span>
          </Link>

          <Link
            href="/dashboard/patients"
            className={`${styles.mobileSidebarLink} ${isActive("/dashboard/patients") ? styles.mobileSidebarLinkActive : ""}`}
          >
            <Users size={20} />
            <span>المرضى</span>
          </Link>

          {(isAdmin || isDoctor) && (
            <Link
              href="/dashboard/inventory"
              className={`${styles.mobileSidebarLink} ${isActive("/dashboard/inventory") ? styles.mobileSidebarLinkActive : ""}`}
            >
              <Package size={20} />
              <span>المخزن الطبي</span>
            </Link>
          )}

          {isAdmin && (
            <>
              {/* Financials Accordion */}
              <button
                className={`${styles.mobileSidebarLink} ${styles.mobileSidebarAccordion} ${isActive("/dashboard/financials") ? styles.mobileSidebarLinkActive : ""}`}
                onClick={() => setFinancialsOpen(!financialsOpen)}
              >
                <Banknote size={20} />
                <span>الحسابات المالية</span>
                <ChevronDown
                  size={16}
                  className={`${styles.accordionIcon} ${financialsOpen ? styles.accordionIconOpen : ""}`}
                />
              </button>
              {financialsOpen && (
                <div className={styles.mobileSidebarSubLinks}>
                  <Link
                    href="/dashboard/financials/income"
                    className={`${styles.mobileSidebarSubLink} ${isActive("/dashboard/financials/income") ? styles.mobileSidebarSubLinkActive : ""}`}
                  >
                    الإيرادات
                  </Link>
                  <Link
                    href="/dashboard/financials/expenses"
                    className={`${styles.mobileSidebarSubLink} ${isActive("/dashboard/financials/expenses") ? styles.mobileSidebarSubLinkActive : ""}`}
                  >
                    المصروفات
                  </Link>
                  <Link
                    href="/dashboard/financials/installments"
                    className={`${styles.mobileSidebarSubLink} ${isActive("/dashboard/financials/installments") ? styles.mobileSidebarSubLinkActive : ""}`}
                  >
                    الأقساط والدفعات
                  </Link>
                  <Link
                    href="/dashboard/financials/salaries"
                    className={`${styles.mobileSidebarSubLink} ${isActive("/dashboard/financials/salaries") ? styles.mobileSidebarSubLinkActive : ""}`}
                  >
                    الرواتب
                  </Link>
                  <Link
                    href="/dashboard/financials/reports"
                    className={`${styles.mobileSidebarSubLink} ${isActive("/dashboard/financials/reports") ? styles.mobileSidebarSubLinkActive : ""}`}
                  >
                    التقارير المالية
                  </Link>
                </div>
              )}

              <Link
                href="/dashboard/staff"
                className={`${styles.mobileSidebarLink} ${isActive("/dashboard/staff") ? styles.mobileSidebarLinkActive : ""}`}
              >
                <Users size={20} />
                <span>فريق العمل</span>
              </Link>
              <Link
                href="/dashboard/reports"
                className={`${styles.mobileSidebarLink} ${isActive("/dashboard/reports") ? styles.mobileSidebarLinkActive : ""}`}
              >
                <Activity size={20} />
                <span>التقارير</span>
              </Link>
              <Link
                href="/dashboard/marketing"
                className={`${styles.mobileSidebarLink} ${isActive("/dashboard/marketing") ? styles.mobileSidebarLinkActive : ""}`}
              >
                <Megaphone size={20} />
                <span>التسويق</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className={`${styles.mobileSidebarLink} ${isActive("/dashboard/settings") ? styles.mobileSidebarLinkActive : ""}`}
              >
                <Settings size={20} />
                <span>الإعدادات</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className={styles.mobileSidebarFooter}>
          <form action={logout}>
            <button type="submit" className={styles.mobileSidebarLogout}>
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Bottom Navigation Bar (always visible on mobile) */}
      <nav className={styles.bottomNav}>
        <Link
          href="/dashboard"
          className={`${styles.bottomNavItem} ${isActive("/dashboard") ? styles.bottomNavItemActive : ""}`}
        >
          <LayoutDashboard size={22} />
          <span>الرئيسية</span>
        </Link>
        <Link
          href="/dashboard/appointments"
          className={`${styles.bottomNavItem} ${isActive("/dashboard/appointments") ? styles.bottomNavItemActive : ""}`}
        >
          <Calendar size={22} />
          <span>المواعيد</span>
        </Link>
        <Link
          href="/dashboard/patients"
          className={`${styles.bottomNavItem} ${isActive("/dashboard/patients") ? styles.bottomNavItemActive : ""}`}
        >
          <Users size={22} />
          <span>المرضى</span>
        </Link>
        <Link
          href="/dashboard/queue"
          className={`${styles.bottomNavItem} ${isActive("/dashboard/queue") ? styles.bottomNavItemActive : ""}`}
        >
          <Activity size={22} />
          <span>الطابور</span>
        </Link>
        <button
          className={styles.bottomNavItem}
          onClick={() => setIsOpen(true)}
        >
          <Menu size={22} />
          <span>المزيد</span>
        </button>
      </nav>
    </>
  );
}
