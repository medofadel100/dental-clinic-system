'use client'

import { useState } from "react";
import { Megaphone, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { sendBroadcastMessage } from "./actions";

export default function MarketingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; sentCount?: number; total?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await sendBroadcastMessage(formData);
    
    setResult(res);
    setLoading(false);
    
    if (res.success) {
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Megaphone size={28} color="var(--primary)" />
          التسويق والإشعارات
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          أرسل رسائل مجمعة (عروض، تهنئة بالعيد، إشعارات مهمة) لجميع المرضى المسجلين لديك بضغطة زر.
        </p>
      </div>

      <div style={{
        backgroundColor: "var(--bg-surface)", padding: "2rem", 
        borderRadius: "var(--radius-lg)", border: "1px solid var(--border)"
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "1rem", fontWeight: 600 }}>نص الرسالة *</label>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
              اكتب الرسالة التي تريد إرسالها. يرجى تجنب إرسال رسائل مزعجة (Spam) حتى لا يتم حظر الرقم من واتساب.
            </p>
            <textarea 
              name="message" 
              required 
              rows={6} 
              placeholder="مثال: كل عام وأنتم بخير بمناسبة العيد 🎉! خصم 20% على تبييض الأسنان هذا الأسبوع في لومينا ديجيتال..."
              style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontFamily: "inherit", resize: "vertical" }}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              backgroundColor: "var(--primary)", color: "white", padding: "1rem",
              borderRadius: "var(--radius-md)", border: "none", cursor: loading ? "not-allowed" : "pointer", 
              fontSize: "1.125rem", fontWeight: 600, opacity: loading ? 0.7 : 1
            }}
          >
            <Send size={20} />
            {loading ? "جاري الإرسال..." : "إرسال الرسالة للجميع"}
          </button>
        </form>

        {result && (
          <div style={{ 
            marginTop: "1.5rem", padding: "1.5rem", borderRadius: "var(--radius-md)",
            backgroundColor: result.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${result.success ? "var(--success)" : "var(--error)"}`,
            display: "flex", alignItems: "center", gap: "1rem"
          }}>
            {result.success ? (
              <>
                <CheckCircle2 size={32} color="var(--success)" />
                <div>
                  <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--success)" }}>تم الإرسال بنجاح!</h3>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    تم إرسال الرسالة إلى {result.sentCount} مريض (من إجمالي {result.total} مرضى مسجلين).
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={32} color="var(--error)" />
                <div>
                  <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--error)" }}>فشل الإرسال</h3>
                  <p style={{ margin: 0, color: "var(--error)", fontSize: "0.875rem" }}>
                    {result.error}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
