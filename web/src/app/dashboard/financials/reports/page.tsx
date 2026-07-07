import { createClient } from "@/utils/supabase/server";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;

  // Fetch Income
  let invoicesQuery = supabase.from("invoices").select("amount_paid, created_at").in('status', ['Paid', 'Partial']);
  if (startDate) invoicesQuery = invoicesQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) invoicesQuery = invoicesQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  const { data: invoices } = await invoicesQuery;

  // Fetch Expenses (excluding salaries)
  let expensesQuery = supabase.from("expenses").select("amount, created_at").neq('category', 'Salary');
  if (startDate) expensesQuery = expensesQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) expensesQuery = expensesQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  const { data: expenses } = await expensesQuery;

  // Fetch Salaries
  let salariesQuery = supabase.from("expenses").select("amount, created_at").eq('category', 'Salary');
  if (startDate) salariesQuery = salariesQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) salariesQuery = salariesQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  const { data: salaries } = await salariesQuery;

  // Fetch Paid Clinic Debts
  let debtsQuery = supabase.from("clinic_debts").select("amount, created_at").eq('is_paid', true);
  if (startDate) debtsQuery = debtsQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) debtsQuery = debtsQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  const { data: clinicDebts } = await debtsQuery;

  const totalIncome = invoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
  const totalSalaries = salaries?.reduce((sum, sal) => sum + Number(sal.amount || 0), 0) || 0;
  const totalDebtsPaid = clinicDebts?.reduce((sum, debt) => sum + Number(debt.amount || 0), 0) || 0;

  const totalOutgoing = totalExpenses + totalSalaries + totalDebtsPaid;
  const netProfit = totalIncome - totalOutgoing;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={28} color="var(--primary)" />
          التقارير المالية الشاملة
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          نظرة عامة على الإيرادات والمصروفات وصافي الربح.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>الفترة الزمنية</h3>
        <form style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>من تاريخ</label>
            <input type="date" name="start" defaultValue={startDate} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>إلى تاريخ</label>
            <input type="date" name="end" defaultValue={endDate} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', height: '45px', backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: "bold", cursor: "pointer" }}>
            تطبيق الفلتر
          </button>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        <div style={{ backgroundColor: "var(--bg-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>إجمالي الإيرادات</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{totalIncome.toLocaleString()} ج.م</div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--bg-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>إجمالي المصروفات</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{totalExpenses.toLocaleString()} ج.م</div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--bg-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>الرواتب والأقساط</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>{(totalSalaries + totalDebtsPaid).toLocaleString()} ج.م</div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--bg-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "2px solid", borderColor: netProfit >= 0 ? "var(--success)" : "var(--error)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "var(--radius-md)", backgroundColor: netProfit >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: netProfit >= 0 ? "var(--success)" : "var(--error)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>صافي الربح الفعلي</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: netProfit >= 0 ? "var(--success)" : "var(--error)" }}>
              {netProfit.toLocaleString()} ج.م
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
