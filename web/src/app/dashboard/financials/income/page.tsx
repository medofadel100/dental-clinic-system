import { createClient } from "@/utils/supabase/server";
import { TrendingUp, FileText } from "lucide-react";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;

  let query = supabase
    .from("invoices")
    .select(
      `
      id, amount_due, amount_paid, created_at, payment_method, status, receipt_number,
      patients (full_name)
    `,
    )
    .in("status", ["Paid", "Partial"])
    .order("created_at", { ascending: false });

  if (startDate) query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) query = query.lte("created_at", `${endDate}T23:59:59.999Z`);

  const { data: invoices } = await query;

  const totalIncome =
    invoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;

  const getPaymentMethodName = (method: string) => {
    const map: Record<string, string> = {
      Cash: "كاش",
      InstaPay: "انستا باي",
      VodafoneCash: "فودافون كاش",
      Installment: "تقسيط",
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
            <TrendingUp size={28} color="var(--success)" />
            الإيرادات (Income)
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            جميع المبالغ المحصلة من المرضى.
          </p>
        </div>
        <div
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            color: "var(--success)",
            padding: "1rem 2rem",
            borderRadius: "var(--radius-lg)",
            fontWeight: "bold",
            fontSize: "1.25rem",
          }}
        >
          الإجمالي: {totalIncome.toLocaleString()} ج.م
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
              <th style={{ padding: "1rem", textAlign: "right" }}>المريض</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                المبلغ المحصل
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                طريقة الدفع
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>
                رقم الإيصال
              </th>
            </tr>
          </thead>
          <tbody>
            {!invoices || invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  لا توجد إيرادات مسجلة بالفترة المحددة.
                </td>
              </tr>
            ) : (
              invoices.map((inv: any) => (
                <tr
                  key={inv.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "1rem" }}>
                    {new Date(inv.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {inv.patients?.full_name}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "var(--success)",
                      fontWeight: "bold",
                    }}
                  >
                    + {inv.amount_paid} ج.م
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {getPaymentMethodName(inv.payment_method)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {inv.receipt_number || "-"}
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
