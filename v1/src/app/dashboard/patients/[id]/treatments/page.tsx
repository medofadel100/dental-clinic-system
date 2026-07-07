import { createClient } from "@/utils/supabase/server";
import { Plus, FileText } from "lucide-react";
import { addTreatmentPlan } from "./actions";

export default async function TreatmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch treatment plans for this patient
  const { data: plans } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("patient_id", resolvedParams.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>
          خطط العلاج الممتدة (Treatment Plans)
        </h2>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
        <strong>💡 ملاحظة هامة:</strong> هذا القسم مخصص <u>للحالات المعقدة فقط</u> مثل (التقويم، زراعة الأسنان، والتركيبات الكاملة) التي تتطلب جلسات متعددة وتُدفع على أقساط. <br/>
        إذا كان المريض يقوم بإجراء بسيط (مثل خلع أو حشو في جلسة واحدة)، فلا داعي لإنشاء خطة علاج هنا، ويمكنك تسجيله مباشرة من تبويب <strong>"الجلسات والفواتير"</strong>.
      </p>

      <div style={{ marginBottom: "2rem" }}>
        <details style={{
          backgroundColor: "var(--bg-surface)",
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}>
          <summary style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            color: "var(--primary)", fontWeight: 600, cursor: "pointer",
            listStyle: "none"
          }}>
            <Plus size={18} />
            <span>إضافة خطة جديدة</span>
          </summary>
          
          <form action={addTreatmentPlan} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <input type="hidden" name="patient_id" value={resolvedParams.id} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>اسم الخطة / التشخيص</label>
              <input type="text" name="name" required style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
              }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>التكلفة الإجمالية التقديرية (ج.م)</label>
              <input type="number" name="total_cost" min="0" step="0.01" defaultValue="0" style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
              }} />
            </div>
            <button type="submit" style={{
              backgroundColor: "var(--primary)", color: "white", border: "none", padding: "0.75rem",
              borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600, marginTop: "0.5rem"
            }}>
              حفظ الخطة
            </button>
          </form>
        </details>
      </div>

      {(!plans || plans.length === 0) ? (
        <div style={{ 
          textAlign: "center", padding: "4rem 2rem", 
          backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", 
          border: "1px solid var(--border)", color: "var(--text-muted)" 
        }}>
          <FileText size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <p>لا توجد خطط علاج مسجلة لهذا المريض.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {plans.map((plan: any) => (
            <div key={plan.id} style={{
              padding: "1.5rem", backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)", border: "1px solid var(--border)"
            }}>
              <h3 style={{ marginBottom: "0.5rem" }}>{plan.name}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                التكلفة الإجمالية: {plan.total_cost} ج.م | الحالة: {plan.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
