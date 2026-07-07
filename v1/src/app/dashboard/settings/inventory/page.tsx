import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Save, Package } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import styles from "../../financials/financials.module.css";

export default async function InventorySettingsPage() {
  const supabase = await createClient();
  const { data: inventory } = await supabase.from('inventory').select('*').order('item_name');

  async function updateMinStock(formData: FormData) {
    'use server'
    const supabase = await createClient();
    const itemId = formData.get('item_id') as string;
    const minStock = parseInt(formData.get('minimum_stock_level') as string);

    if (itemId && minStock >= 0) {
      await supabase.from('inventory').update({ minimum_stock_level: minStock }).eq('id', itemId);
      revalidatePath('/dashboard/settings/inventory');
      revalidatePath('/dashboard/inventory');
      revalidatePath('/dashboard');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/settings" className={styles.secondaryBtn} style={{ padding: "0.5rem" }}>
            <ArrowRight size={24} />
          </Link>
          <h1 className={styles.pageTitle}>إعدادات المخزن (الحدود الدنيا)</h1>
        </div>
      </div>

      <div className={styles.detailsCard} style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--primary)" }}>
          <Package size={24} />
          <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>تحديد الحد الأدنى للتنبيه لكل صنف</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.875rem" }}>
          قم بتحديث الحد الأدنى لكل منتج. بمجرد أن تصل كمية المنتج إلى هذا الحد، سيظهر تنبيه أحمر في الصفحة الرئيسية.
        </p>

        {(!inventory || inventory.length === 0) ? (
          <p className={styles.placeholderText}>لا يوجد أصناف مسجلة في المخزن حالياً.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {inventory.map(item => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface)", flexWrap: "wrap", gap: "1rem"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <strong style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{item.item_name}</strong>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>الكمية الحالية: {item.quantity} {item.unit}</span>
                </div>

                <form action={updateMinStock} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="hidden" name="item_id" value={item.id} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>الحد الأدنى:</label>
                    <input type="number" name="minimum_stock_level" defaultValue={item.minimum_stock_level} min="0" required style={{
                      padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                      backgroundColor: "var(--bg-main)", color: "var(--text-primary)", width: "80px", textAlign: "center"
                    }} />
                  </div>
                  <button type="submit" style={{
                    display: "flex", alignItems: "center", gap: "0.25rem",
                    backgroundColor: "var(--primary)", color: "white", border: "none",
                    padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", cursor: "pointer"
                  }}>
                    <Save size={16} />
                    حفظ
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
