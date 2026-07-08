import styles from "../../financials/financials.module.css";
import { ArrowRight, Save, UserPlus } from "lucide-react";
import Link from "next/link";
import { createStaffMember } from "../actions";

export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/staff" className={styles.backButton}>
            <ArrowRight size={20} />
          </Link>
          <h1 className={styles.pageTitle}>إضافة موظف جديد</h1>
        </div>
      </div>

      {error === "exists" && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "var(--error)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--error)",
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          ⚠️ فشل إنشاء الحساب! البريد الإلكتروني مسجل بالفعل لموظف آخر. يرجى
          استخدام بريد مختلف.
        </div>
      )}

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "2rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <form
          action={createStaffMember}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              الاسم بالكامل
            </label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="مثال: د. أحمد محمد"
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              البريد الإلكتروني (لتسجيل الدخول)
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="ahmed@luminadigital.com"
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="كلمة المرور للموظف"
              minLength={6}
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="01xxxxxxxxx"
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              الدور في العيادة
            </label>
            <select
              name="role"
              required
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            >
              <option value="Doctor">طبيب</option>
              <option value="Receptionist">موظف استقبال</option>
              <option value="Admin">مدير العيادة (كامل الصلاحيات)</option>
            </select>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              التخصص (للأطباء فقط)
            </label>
            <input
              type="text"
              name="specialization"
              placeholder="مثال: تقويم أسنان"
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "1rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <Link
              href="/dashboard/staff"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              إلغاء
            </Link>
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                backgroundColor: "var(--primary)",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <UserPlus size={20} />
              إنشاء الحساب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
