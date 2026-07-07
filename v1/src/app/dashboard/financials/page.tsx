import { createClient } from "@/utils/supabase/server";
import styles from "./financials.module.css";
import { TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import Link from "next/link";

export default async function FinancialsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; exp_cat?: string; inc_type?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;
  const expCat = resolvedParams.exp_cat;
  const incType = resolvedParams.inc_type;

  // Fetch all invoices (Income)
  let invoicesQuery = supabase.from("invoices").select("amount_due, amount_paid, created_at, payment_method, status, receipt_number");
  if (startDate) invoicesQuery = invoicesQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) invoicesQuery = invoicesQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  if (incType) invoicesQuery = invoicesQuery.eq("payment_method", incType);
  const { data: invoices } = await invoicesQuery;

  // Fetch all expenses
  let expensesQuery = supabase.from("expenses").select("amount, created_at, category, description, payment_method, receipt_number");
  if (startDate) expensesQuery = expensesQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) expensesQuery = expensesQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  if (expCat) expensesQuery = expensesQuery.eq("category", expCat);
  const { data: expenses } = await expensesQuery;

  // Calculate totals
  const totalIncome = invoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
  const netProfit = totalIncome - totalExpenses;

  const getExpenseCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      Inventory: "خامات وأدوات",
      Salary: "رواتب وأجور",
      Utility: "فواتير ومرافق",
      Marketing: "تسويق",
      Other: "أخرى"
    };
    return map[cat] || cat;
  };

  const getPaymentMethodName = (method: string) => {
    const map: Record<string, string> = {
      Cash: "كاش",
      InstaPay: "انستا باي",
      VodafoneCash: "فودافون كاش",
      Installment: "تقسيط"
    };
    return map[method] || "غير محدد";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>الخزينة والحسابات المالية</h1>
        <div className={styles.headerActions}>
          <Link href="/dashboard/financials/expenses/new" className={styles.secondaryBtn}>
            <TrendingDown size={18} />
            <span>تسجيل مصروف</span>
          </Link>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>الفلاتر المتقدمة</h3>
        <form style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>من تاريخ</label>
            <input type="date" name="start" defaultValue={startDate} style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'inherit'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>إلى تاريخ</label>
            <input type="date" name="end" defaultValue={endDate} style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'inherit'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>نوع المصروف</label>
            <select name="exp_cat" defaultValue={expCat || ""} style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'inherit', minWidth: '150px'
            }}>
              <option value="">الكل</option>
              <option value="Inventory">خامات وأدوات</option>
              <option value="Salary">رواتب وأجور</option>
              <option value="Utility">فواتير ومرافق</option>
              <option value="Marketing">تسويق</option>
              <option value="Other">أخرى</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>طريقة الدفع (للدخل)</label>
            <select name="inc_type" defaultValue={incType || ""} style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'inherit', minWidth: '150px'
            }}>
              <option value="">الكل</option>
              <option value="Cash">كاش</option>
              <option value="InstaPay">انستا باي</option>
              <option value="VodafoneCash">فودافون كاش</option>
              <option value="Installment">تقسيط</option>
            </select>
          </div>
          <button type="submit" className={styles.primaryBtn} style={{ padding: '0.75rem 1.5rem', height: '45px' }}>
            تطبيق
          </button>
          {(startDate || endDate || expCat || incType) && (
            <Link href="/dashboard/financials" className={styles.secondaryBtn} style={{ padding: '0.75rem 1.5rem', height: '45px', textDecoration: 'none' }}>
              إلغاء
            </Link>
          )}
        </form>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>إجمالي الإيرادات (للفلتر)</span>
            <span className={styles.statValue}>{totalIncome.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)" }}>
            <TrendingDown size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>إجمالي المصروفات (للفلتر)</span>
            <span className={styles.statValue}>{totalExpenses.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary)" }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>صافي الربح (للفلتر)</span>
            <span className={styles.statValue} style={{ color: netProfit >= 0 ? "var(--success)" : "var(--error)" }}>
              {netProfit.toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailsCard}>
          <h3>المصروفات المفلترة</h3>
          {(!expenses || expenses.length === 0) ? (
            <p className={styles.emptyText}>لا توجد مصروفات مسجلة بهذه الشروط.</p>
          ) : (
            <ul className={styles.list}>
              {expenses.map((exp, idx) => (
                <li key={idx} className={styles.listItem} style={{ display: 'block', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', outline: 'none' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{getExpenseCategoryName(exp.category)}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{new Date(exp.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</div>
                      </div>
                      <span className={styles.negativeAmount} style={{ fontWeight: 600 }}>- {exp.amount} ج.م</span>
                    </summary>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                        <div><strong>طريقة الدفع: </strong>{getPaymentMethodName(exp.payment_method)}</div>
                        <div><strong>رقم الإيصال: </strong>{exp.receipt_number || <span style={{ color: 'var(--text-secondary)' }}>غير مسجل</span>}</div>
                      </div>
                      <strong>الوصف: </strong>
                      {exp.description ? exp.description : <span style={{ color: 'var(--text-secondary)' }}>لا يوجد وصف مفصل لهذا المصروف.</span>}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.detailsCard}>
          <h3>الإيرادات المفلترة</h3>
          {(!invoices || invoices.length === 0) ? (
            <p className={styles.emptyText}>لا توجد دفعات مسجلة بهذه الشروط.</p>
          ) : (
            <ul className={styles.list}>
              {invoices.map((inv, idx) => (
                <li key={idx} className={styles.listItem} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>دفعة مريض ({getPaymentMethodName(inv.payment_method)})</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {new Date(inv.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      {inv.receipt_number && ` | إيصال: ${inv.receipt_number}`}
                    </div>
                  </div>
                  <span className={styles.positiveAmount} style={{ fontWeight: 600 }}>+ {inv.amount_paid} ج.م</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
