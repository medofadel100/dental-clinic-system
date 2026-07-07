import { createClient } from "@/utils/supabase/server";
import { Package, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import styles from "../financials/financials.module.css";
import { updateInventoryQuantity, addInventoryItem } from "./actions";

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")
    .order("created_at", { ascending: false });

  if (!inventory) return <p>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>المخزن الطبي</h1>
      </div>

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
            <Plus size={20} />
            <span>إضافة صنف جديد</span>
          </summary>
          
          <form action={addInventoryItem} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>اسم الصنف</label>
                <input type="text" name="item_name" required style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الوحدة (مثل: قطعة، عبوة، سرنجة)</label>
                <input type="text" name="unit" required style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
                }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الكمية المبدئية</label>
                <input type="number" name="quantity" min="0" defaultValue="0" style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الحد الأدنى للتنبيه</label>
                <input type="number" name="minimum_stock_level" min="0" defaultValue="10" style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>تاريخ الصلاحية (اختياري)</label>
                <input type="date" name="expiration_date" style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)", color: "var(--text-primary)"
                }} />
              </div>
            </div>

            <button type="submit" style={{
              backgroundColor: "var(--primary)", color: "white", border: "none", padding: "0.75rem",
              borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600, marginTop: "0.5rem",
              width: "fit-content"
            }}>
              حفظ الصنف
            </button>
          </form>
        </details>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {inventory.map((item) => {
          const isLowStock = item.quantity <= item.minimum_stock_level;
          
          return (
            <div key={item.id} className={styles.detailsCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: isLowStock ? '4px solid var(--error)' : '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    backgroundColor: isLowStock ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", 
                    color: isLowStock ? "var(--error)" : "var(--success)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {isLowStock ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{item.item_name}</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      الكمية الحالية: {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              {isLowStock && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                  ⚠️ اقترب من النفاذ (الحد الأدنى: {item.minimum_stock_level})
                </div>
              )}

              <form action={updateInventoryQuantity} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto' }}>
                <input type="hidden" name="itemId" value={item.id} />
                <input type="number" name="quantity_change" defaultValue={0} required style={{
                  padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", fontFamily: "inherit", width: '80px'
                }} />
                <button type="submit" name="action" value="add" style={{
                  backgroundColor: "var(--success)", color: "white", border: "none", 
                  padding: "0.5rem", borderRadius: "var(--radius-md)", cursor: "pointer", flex: 1
                }}>
                  توريد (+)
                </button>
                <button type="submit" name="action" value="subtract" style={{
                  backgroundColor: "var(--error)", color: "white", border: "none", 
                  padding: "0.5rem", borderRadius: "var(--radius-md)", cursor: "pointer", flex: 1
                }}>
                  صرف (-)
                </button>
              </form>
            </div>
          );
        })}

        {inventory.length === 0 && (
          <p className={styles.placeholderText}>المخزن فارغ حالياً.</p>
        )}
      </div>
    </div>
  );
}
