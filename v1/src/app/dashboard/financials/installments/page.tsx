import { createClient } from "@/utils/supabase/server";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { payInstallment } from "./actions";

export default async function InstallmentsPage() {
  const supabase = await createClient();

  // Fetch unpaid or partial installments
  const { data: installments } = await supabase
    .from("installments")
    .select(`
      id, amount_due, amount_paid, session_number, status, created_at,
      patients (id, full_name, phone),
      invoices (id, total_sessions, checkup_fee_deducted)
    `)
    .in('status', ['Unpaid', 'Partial'])
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={28} color="var(--primary)" />
            متابعة الدفعات والأقساط (Installments)
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            إدارة تحصيل الدفعات من المرضى بناءً على جلساتهم المجدولة.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {installments?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
            <p style={{ color: "var(--text-secondary)" }}>لا توجد أي دفعات مستحقة حالياً.</p>
          </div>
        ) : (
          installments?.map((inst: any) => {
            const remaining = Number(inst.amount_due) - Number(inst.amount_paid);
            
            return (
              <div key={inst.id} style={{ 
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", alignItems: "center",
                padding: "1.5rem", backgroundColor: "var(--bg-surface)", 
                borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)"
              }}>
                
                {/* Patient Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{inst.patients?.full_name}</h3>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    <span>📞 {inst.patients?.phone}</span>
                  </div>
                  {inst.invoices?.checkup_fee_deducted && (
                    <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.2rem 0.5rem", borderRadius: "4px", width: "fit-content" }}>
                      تم خصم ثمن الكشف مسبقاً
                    </span>
                  )}
                </div>

                {/* Financial Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    الجلسة رقم: <span style={{ color: "var(--text-primary)" }}>{inst.session_number} من {inst.invoices?.total_sessions}</span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    قيمة الدفعة الكلية: <span style={{ color: "var(--text-primary)" }}>{inst.amount_due} ج.م</span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    تم دفع: <span style={{ color: "var(--success)" }}>{inst.amount_paid} ج.م</span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    المتبقي من هذه الدفعة: <span style={{ color: "var(--danger)" }}>{remaining} ج.م</span>
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <form action={payInstallment} style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="installment_id" value={inst.id} />
                    <input 
                      type="number" name="amount" required max={remaining} defaultValue={remaining} step="10"
                      style={{ width: "100px", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
                    />
                    <button type="submit" style={{ 
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.5rem 1rem", backgroundColor: "var(--success)", color: "white",
                      border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600
                    }}>
                      <CheckCircle2 size={18} />
                      تحصيل
                    </button>
                  </form>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
