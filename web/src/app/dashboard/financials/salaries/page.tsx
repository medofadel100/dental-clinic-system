import { createClient } from "@/utils/supabase/server";
import { Users, Plus } from "lucide-react";
import Link from "next/link";

export default async function SalariesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;

  let query = supabase
    .from("expenses")
    .select(
      `id, amount, created_at, description, payment_method, receipt_number`,
    )
    .eq("category", "Salary")
    .order("created_at", { ascending: false });

  if (startDate) query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) query = query.lte("created_at", `${endDate}T23:59:59.999Z`);

  const { data: salaries } = await query;

  const totalSalaries =
    salaries?.reduce((sum, sal) => sum + Number(sal.amount || 0), 0) || 0;

  const getPaymentMethodName = (method: string) => {
    const map: Record<string, string> = {
      Cash: "كاش",
      InstaPay: "انستا باي",
      VodafoneCash: "فودافون كاش",
      BankTransfer: "تحويل بنكي",
    };
    return map[method] || method || "غير محدد";
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Users size={28} color="var(--primary)" />
            رواتب الموظفين والأطباء
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            سجل الرواتب والأجور المدفوعة لفريق العمل.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "var(--primary)",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-lg)",
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            الإجمالي: {totalSalaries.toLocaleString()} ج.م
          </div>
          <Link
            href="/dashboard/financials/expenses/new"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--primary)",
              color: "white",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: "bold",
            }}
          >
            <Plus size={20} />
            تسجيل راتب جديد
          </Link>
        </div>
      </div>

      <form
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "2rem",
          backgroundColor: "var(--bg-surface)",
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            من تاريخ
          </label>
          <input
            type="date"
            name="start"
            defaultValue={startDate}
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
          <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            إلى تاريخ
          </label>
          <input
            type="date"
            name="end"
            defaultValue={endDate}
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            height: "45px",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          تطبيق الفلتر
        </button>
      </form>

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "var(--bg-main)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th style={{ padding: "1rem", textAlign: "right" }}>التاريخ</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                الموظف / الوصف
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                قيمة الراتب
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                طريقة الدفع
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                الإيصال / المرجع
              </th>
            </tr>
          </thead>
          <tbody>
            {!salaries || salaries.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  لا توجد رواتب مسجلة بالفترة المحددة.
                </td>
              </tr>
            ) : (
              salaries.map((sal: any) => (
                <tr
                  key={sal.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "1rem" }}>
                    {new Date(sal.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {sal.description || "بدون وصف"}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "var(--error)",
                      fontWeight: "bold",
                    }}
                  >
                    - {sal.amount} ج.م
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {getPaymentMethodName(sal.payment_method)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {sal.receipt_number || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
