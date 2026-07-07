import { createClient } from "@/utils/supabase/server";
import { Plus, CheckCircle, Clock, XCircle, Beaker } from "lucide-react";
import { createLabOrder, updateLabOrderStatus } from "./actions";
import Link from "next/link";

export default async function LabOrdersPage() {
  const supabase = await createClient();

  // Fetch all lab orders
  const { data: orders } = await supabase
    .from("lab_orders")
    .select("*, patients(full_name), profiles(full_name)")
    .order("sent_date", { ascending: false });

  // Fetch patients and doctors for the dropdowns
  const { data: patients } = await supabase.from("patients").select("id, full_name");
  const { data: doctors } = await supabase.from("profiles").select("id, full_name").eq("is_doctor", true);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Beaker size={28} color="var(--primary)" />
            إدارة المعامل والتركيبات
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            تتبع طلبات التركيبات المرسلة للمعامل الخارجية ومواعيد استلامها.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Side: Orders List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              <Beaker size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)" }}>لا توجد طلبات معمل مسجلة حتى الآن.</p>
            </div>
          ) : (
            orders?.map((order) => (
              <div key={order.id} style={{
                backgroundColor: "var(--bg-surface)", padding: "1.5rem", 
                borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--primary)" }}>{order.work_description}</h3>
                    <span style={{
                      padding: "0.25rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600,
                      backgroundColor: order.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : order.status === 'Received' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: order.status === 'Pending' ? '#eab308' : order.status === 'Received' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {order.status === 'Pending' ? 'قيد التنفيذ' : order.status === 'Received' ? 'تم الاستلام' : 'مرتجع/ملغى'}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    <span><strong>المعمل:</strong> {order.lab_name}</span>
                    <span><strong>المريض:</strong> {(order.patients as any)?.full_name || 'غير محدد'}</span>
                    <span><strong>الطبيب:</strong> {(order.profiles as any)?.full_name || 'غير محدد'}</span>
                  </div>

                  <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    <span><strong>تاريخ الإرسال:</strong> {new Date(order.sent_date).toLocaleDateString('ar-EG')}</span>
                    {order.expected_return_date && (
                      <span style={{ color: order.status === 'Pending' && new Date(order.expected_return_date) < new Date() ? 'var(--error)' : 'inherit' }}>
                        <strong>تاريخ الاستلام المتوقع:</strong> {new Date(order.expected_return_date).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                  </div>
                  
                  {order.notes && <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}><strong>ملاحظات:</strong> {order.notes}</p>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                  <span style={{ fontWeight: 600, fontSize: "1.125rem" }}>{order.cost} ج.م</span>
                  
                  {order.status === 'Pending' && (
                    <form action={async () => {
                      "use server";
                      await updateLabOrderStatus(order.id, 'Received', new Date().toISOString().split('T')[0]);
                    }}>
                      <button type="submit" style={{
                        display: "flex", alignItems: "center", gap: "0.25rem",
                        backgroundColor: "var(--success)", color: "white", padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontSize: "0.875rem"
                      }}>
                        <CheckCircle size={16} /> تحديد كتم الاستلام
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Add New Order Form */}
        <div style={{
          backgroundColor: "var(--bg-surface)", padding: "1.5rem", 
          borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
          position: "sticky", top: "2rem"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.125rem", color: "var(--text-primary)" }}>إضافة طلب جديد</h3>
          
          <form action={createLabOrder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>اسم المعمل *</label>
              <input type="text" name="lab_name" required style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>وصف العمل (التركيبة) *</label>
              <input type="text" name="work_description" placeholder="مثال: طربوش زركون للسن 36" required style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>المريض</label>
              <select name="patient_id" style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "white" }}>
                <option value="">-- اختر المريض --</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الطبيب المعالج</label>
              <select name="doctor_id" style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)", backgroundColor: "white" }}>
                <option value="">-- اختر الطبيب --</option>
                {doctors?.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>تاريخ الإرسال *</label>
                <input type="date" name="sent_date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>تاريخ الاستلام</label>
                <input type="date" name="expected_return_date" style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>التكلفة (ج.م) *</label>
              <input type="number" name="cost" required defaultValue="0" min="0" style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>ملاحظات إضافية</label>
              <textarea name="notes" rows={2} style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid var(--border)" }}></textarea>
            </div>

            <button type="submit" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              backgroundColor: "var(--primary)", color: "white", padding: "0.75rem",
              borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 600, marginTop: "0.5rem"
            }}>
              <Plus size={20} />
              حفظ الطلب
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
