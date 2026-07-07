import styles from "./patient.module.css";
import Link from "next/link";
import { ArrowRight, User, Activity, FileText, ImageIcon, ClipboardList } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!patient) return <div>المريض غير موجود</div>;

  return (
    <div className={styles.container}>
      {/* Header and Breadcrumbs */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link href="/dashboard/patients" className={styles.backBtn}>
            <ArrowRight size={24} />
          </Link>
          <div>
            <h1 className={styles.pageTitle}>{patient.full_name}</h1>
            <p className={styles.patientPhone} dir="ltr">{patient.phone}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <Link href={`/dashboard/patients/${resolvedParams.id}`} className={styles.tab}>
          <User size={18} />
          <span>الملف الشخصي</span>
        </Link>
        <Link href={`/dashboard/patients/${resolvedParams.id}/medical-history`} className={styles.tab}>
          <FileText size={18} />
          <span>التاريخ الطبي</span>
        </Link>
        <Link href={`/dashboard/patients/${resolvedParams.id}/odontogram`} className={styles.tab}>
          <Activity size={18} />
          <span>مخطط الأسنان</span>
        </Link>
        <Link href={`/dashboard/patients/${resolvedParams.id}/sessions`} className={styles.tab}>
          <Activity size={18} />
          <span>الجلسات والفواتير</span>
        </Link>
        <Link href={`/dashboard/patients/${resolvedParams.id}/treatments`} className={styles.tab}>
          <FileText size={18} />
          <span>خطة العلاج</span>
        </Link>
        <Link href={`/dashboard/patients/${resolvedParams.id}/prescriptions`} className={styles.tab}>
          <ClipboardList size={18} />
          <span>الروشتات</span>
        </Link>
        <Link href={`/dashboard/patients/${resolvedParams.id}/media`} className={styles.tab}>
          <ImageIcon size={18} />
          <span>الأشعة والملفات</span>
        </Link>
      </div>

      {/* Tab Content Area */}
      <div className={styles.tabContent}>
        {children}
      </div>
    </div>
  );
}
