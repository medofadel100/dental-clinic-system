'use client'

import styles from "../../financials.module.css";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { saveExpense } from "../../actions";

export default function NewExpensePage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/financials" className={styles.secondaryBtn} style={{ padding: "0.5rem" }}>
            <ArrowRight size={24} />
          </Link>
          <h1 className={styles.pageTitle}>تسجيل مصروف جديد</h1>
        </div>
      </div>

      <div className={styles.detailsCard} style={{ maxWidth: "600px" }}>
        <form action={saveExpense} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>المبلغ (ج.م)</label>
            <input type="number" name="amount" required step="0.01" style={{
              padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>التصنيف</label>
            <select name="category" required style={{
              padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
            }}>
              <option value="Inventory">خامات وأدوات (Inventory)</option>
              <option value="Salary">رواتب وأجور (Salary)</option>
              <option value="Utility">فواتير ومرافق (Utility)</option>
              <option value="Marketing">تسويق (Marketing)</option>
              <option value="Other">أخرى (Other)</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>طريقة الدفع</label>
              <select name="payment_method" required style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
              }}>
                <option value="Cash">كاش</option>
                <option value="InstaPay">انستا باي</option>
                <option value="VodafoneCash">فودافون كاش</option>
                <option value="Installment">تقسيط</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>رقم الإيصال / الرسيت (اختياري)</label>
              <input type="text" name="receipt_number" placeholder="مثال: REC-12345" style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
              }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>ملاحظات / وصف المصروف</label>
            <textarea name="description" rows={3} style={{
              padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit", resize: "vertical"
            }}></textarea>
          </div>

          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", 
            backgroundColor: "var(--primary)", color: "white", 
            border: "none", padding: "0.875rem", borderRadius: "var(--radius-md)", 
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600
          }}>
            <Save size={20} />
            <span>حفظ المصروف</span>
          </button>
        </form>
      </div>
    </div>
  );
}
