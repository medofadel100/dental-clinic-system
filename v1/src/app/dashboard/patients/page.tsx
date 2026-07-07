import styles from "./patients.module.css";
import { getPatients } from "./actions";
import Link from "next/link";
import { Plus, User, Calendar, Phone } from "lucide-react";

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>سجل المرضى</h1>
        <Link href="/dashboard/patients/new" className={styles.primaryBtn}>
          <Plus size={20} />
          <span>إضافة مريض جديد</span>
        </Link>
      </div>

      <div className={styles.tableCard}>
        {patients.length === 0 ? (
          <div className={styles.emptyState}>
            <User size={48} className={styles.emptyIcon} />
            <p>مفيش مرضى متسجلين لسه. اضغط على "إضافة مريض جديد" للبدء.</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم التليفون</th>
                  <th>تاريخ الميلاد</th>
                  <th>تاريخ التسجيل</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient: any) => (
                  <tr key={patient.id}>
                    <td className={styles.boldCell}>{patient.full_name}</td>
                    <td dir="ltr" className={styles.phoneCell}>{patient.phone}</td>
                    <td>{new Date(patient.date_of_birth).toLocaleDateString('ar-EG')}</td>
                    <td>{new Date(patient.created_at).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <Link href={`/dashboard/patients/${patient.id}`} className={styles.actionLink}>
                        عرض الملف
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
