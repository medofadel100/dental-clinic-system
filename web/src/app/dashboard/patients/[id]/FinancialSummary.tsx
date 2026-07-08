"use client";

import { useState } from "react";
import styles from "./patient.module.css";
import { Plus } from "lucide-react";
import { createInvoice } from "./actions";

export default function FinancialSummary({
  patientId,
  initialInvoices,
}: {
  patientId: string;
  initialInvoices: any[];
}) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>الملخص المالي</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.875rem",
          }}
        >
          <Plus size={16} /> إضافة دفعة
        </button>
      </div>

      {isAdding && (
        <form
          action={async (formData) => {
            await createInvoice(formData);
            setIsAdding(false);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1rem",
            padding: "1rem",
            backgroundColor: "var(--bg-main)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <input type="hidden" name="patientId" value={patientId} />
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              إجمالي المطلوب (ج.م)
            </label>
            <input
              type="number"
              name="amount_due"
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              المدفوع (ج.م)
            </label>
            <input
              type="number"
              name="amount_paid"
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              طريقة الدفع
            </label>
            <select
              name="payment_method"
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                borderRadius: "4px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-white)",
              }}
            >
              <option value="Cash">كاش</option>
              <option value="InstaPay">انستا باي</option>
              <option value="VodafoneCash">فودافون كاش</option>
              <option value="Installment">تقسيط</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              رقم الإيصال (اختياري)
            </label>
            <input
              type="text"
              name="receipt_number"
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.5rem",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            حفظ
          </button>
        </form>
      )}

      {initialInvoices.length === 0 ? (
        <p className={styles.placeholderText}>لا توجد فواتير أو دفعات.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {initialInvoices.map((inv) => (
            <li
              key={inv.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>
                  {inv.status === "Paid"
                    ? "خالص"
                    : inv.status === "Partial"
                      ? "جزء مدفوع"
                      : "غير مدفوع"}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {new Date(inv.created_at).toLocaleDateString("ar-EG")} -{" "}
                  {inv.payment_method || "بدون تحديد"}
                  {inv.receipt_number && ` | إيصال: ${inv.receipt_number}`}
                </span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "var(--success)", fontWeight: 600 }}>
                  + {inv.amount_paid} ج.م
                </div>
                {inv.amount_due > inv.amount_paid && (
                  <div style={{ color: "var(--error)", fontSize: "0.75rem" }}>
                    متبقي: {inv.amount_due - inv.amount_paid} ج.م
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
