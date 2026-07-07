import { createClient } from "@/utils/supabase/server";
import { CreditCard, CheckCircle2, AlertCircle, Building, Plus, FileText } from "lucide-react";
import { payInstallment, addClinicDebt, payClinicDebt } from "./actions";
import Link from "next/link";

export default async function InstallmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; start?: string; end?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || 'patients';
  const startDate = resolvedParams.start;
  const endDate = resolvedParams.end;

  let patientQuery = supabase
    .from("installments")
    .select(`
      id, amount_due, amount_paid, session_number, status, created_at,
      patients (id, full_name, phone),
      invoices (id, total_sessions, checkup_fee_deducted)
    `)
    .in('status', ['Unpaid', 'Partial'])
    .order('created_at', { ascending: false });

  if (startDate) patientQuery = patientQuery.gte("created_at", `${startDate}T00:00:00.000Z`);
  if (endDate) patientQuery = patientQuery.lte("created_at", `${endDate}T23:59:59.999Z`);
  const { data: patientInstallments } = await patientQuery;

  let clinicQuery = supabase
    .from("clinic_debts")
    .select('*')
    .order('is_paid', { ascending: true })
    .order('due_date', { ascending: true });

  if (startDate) clinicQuery = clinicQuery.gte("due_date", startDate);
  if (endDate) clinicQuery = clinicQuery.lte("due_date", endDate);
  const { data: clinicDebts, error: debtsError } = await clinicQuery;

  const getPaymentMethodName = (method: string) => {
    const map: Record<string, string> = { Cash: "كاش", InstaPay: "انستا باي", VodafoneCash: "فودافون كاش", BankTransfer: "تحويل بنكي" };
    return map[method] || method || "غير محدد";
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={28} color="var(--primary)" />
            الأقساط والمديونيات (Installments & Debts)
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            إدارة تحصيل الدفعات من المرضى وسداد أقساط العيادة للجهات الخارجية.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <Link href={`?tab=patients${startDate ? `&start=${startDate}` : ''}${endDate ? `&end=${endDate}` : ''}`} style={{
          padding: "0.75rem 1.5rem", borderRadius: "var(--radius-md)", fontWeight: 600, textDecoration: "none",
          backgroundColor: activeTab === 'patients' ? "var(--primary)" : "var(--bg-surface)",
          color: activeTab === 'patients' ? "white" : "var(--text-secondary)",
          border: activeTab === 'patients' ? "none" : "1px solid var(--border)"
        }}>
          أقساط المرضى (للعيادة)
        </Link>
        <Link href={`?tab=clinic${startDate ? `&start=${startDate}` : ''}${endDate ? `&end=${endDate}` : ''}`} style={{
          padding: "0.75rem 1.5rem", borderRadius: "var(--radius-md)", fontWeight: 600, textDecoration: "none",
          backgroundColor: activeTab === 'clinic' ? "var(--primary)" : "var(--bg-surface)",
          color: activeTab === 'clinic' ? "white" : "var(--text-secondary)",
          border: activeTab === 'clinic' ? "none" : "1px solid var(--border)"
        }}>
          مديونيات العيادة (للخارج)
        </Link>
      </div>

      <form style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '2rem', backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <input type="hidden" name="tab" value={activeTab} />
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

      {activeTab === 'patients' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {patientInstallments?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
              <p style={{ color: "var(--text-secondary)" }}>لا توجد أي دفعات مستحقة حالياً على المرضى بالفترة المحددة.</p>
            </div>
          ) : (
            patientInstallments?.map((inst: any) => {
              const remaining = Number(inst.amount_due) - Number(inst.amount_paid);
              return (
                <div key={inst.id} style={{ 
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", alignItems: "center",
                  padding: "1.5rem", backgroundColor: "var(--bg-surface)", 
                  borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{inst.patients?.full_name}</h3>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>📞 {inst.patients?.phone}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.25rem" }}>تاريخ الجلسة: {new Date(inst.created_at).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      قيمة الدفعة الكلية: <span style={{ color: "var(--text-primary)" }}>{inst.amount_due} ج.م</span>
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      تم دفع: <span style={{ color: "var(--success)" }}>{inst.amount_paid} ج.م</span>
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      المتبقي: <span style={{ color: "var(--danger)" }}>{remaining} ج.م</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <form action={payInstallment} style={{ display: "flex", gap: "0.5rem" }}>
                      <input type="hidden" name="installment_id" value={inst.id} />
                      <input type="number" name="amount" required max={remaining} defaultValue={remaining} step="10" style={{ width: "100px", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                      <button type="submit" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--success)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}>
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
      )}

      {activeTab === 'clinic' && (
        <div>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>إضافة قسط / مديونية جديدة للعيادة</h3>
            <form action={addClinicDebt} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>اسم البند (مثال: قسط جهاز أشعة)</label>
                <input type="text" name="item_name" required style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "150px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>قيمة القسط (ج.م)</label>
                <input type="number" name="amount" required min="1" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "180px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>تاريخ الاستحقاق</label>
                <input type="date" name="due_date" required style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }} />
              </div>
              <button type="submit" style={{ padding: "0.75rem 1.5rem", height: "45px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={18} />
                إضافة
              </button>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {debtsError ? (
              <div style={{ padding: "1.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error)", borderRadius: "var(--radius-md)" }}>
                يرجى تنفيذ أمر إنشاء جدول (clinic_debts) في قاعدة البيانات أولاً لتفعيل هذه الميزة.
              </div>
            ) : clinicDebts?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
                <p style={{ color: "var(--text-secondary)" }}>لا توجد مديونيات أو أقساط مسجلة على العيادة بالفترة المحددة.</p>
              </div>
            ) : (
              clinicDebts?.map((debt: any) => (
                <div key={debt.id} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
                  padding: "1.5rem", backgroundColor: debt.is_paid ? "rgba(16, 185, 129, 0.05)" : "var(--bg-surface)", 
                  borderRadius: "var(--radius-lg)", border: debt.is_paid ? "1px solid var(--success)" : "1px solid var(--border)",
                  opacity: debt.is_paid ? 0.7 : 1
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: debt.is_paid ? "var(--success)" : "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {debt.is_paid && <CheckCircle2 size={20} />}
                      {debt.item_name}
                    </h3>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      تاريخ الاستحقاق: {new Date(debt.due_date).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: debt.is_paid ? "var(--success)" : "var(--error)" }}>
                    {debt.amount} ج.م
                  </div>

                  {!debt.is_paid ? (
                    <form action={payClinicDebt} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input type="hidden" name="debt_id" value={debt.id} />
                      <select name="payment_method" required style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)" }}>
                        <option value="">طريقة الدفع...</option>
                        <option value="Cash">كاش</option>
                        <option value="BankTransfer">تحويل بنكي</option>
                        <option value="InstaPay">انستا باي</option>
                      </select>
                      <input type="text" name="receipt_number" placeholder="رقم الإيصال (اختياري)" style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-main)" }} />
                      <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "var(--success)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}>
                        تسديد الآن
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: "left", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      <div>تم الدفع: {getPaymentMethodName(debt.payment_method)}</div>
                      {debt.receipt_number && <div>إيصال: {debt.receipt_number}</div>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
