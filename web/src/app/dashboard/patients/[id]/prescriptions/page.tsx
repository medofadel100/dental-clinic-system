"use client";

import { useState, use, useEffect } from "react";
import { Send, Pill, Image as ImageIcon, Clock } from "lucide-react";
import {
  sendPrescriptionWhatsApp,
  requestXRayWhatsApp,
  getPatientPrescriptions,
} from "./actions";

export default function PrescriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(false);
  const [xrayLoading, setXrayLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([]);

  const fetchPrescriptions = async () => {
    const res = await getPatientPrescriptions(resolvedParams.id);
    if (res.success && res.data) {
      setPastPrescriptions(res.data);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await sendPrescriptionWhatsApp(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      fetchPrescriptions(); // Refresh history
    } else {
      alert(result.error || "حصل مشكلة أثناء الإرسال للواتساب.");
    }
  };

  const handleRequestXRay = async () => {
    const xrayType = prompt(
      "ما هو نوع الأشعة المطلوب؟ (مثال: بانوراما، أشعة مقطعية)",
    );
    if (!xrayType) return;

    setXrayLoading(true);
    const formData = new FormData();
    formData.append("patientId", resolvedParams.id);
    formData.append("xrayType", xrayType);

    const result = await requestXRayWhatsApp(formData);
    setXrayLoading(false);

    if (result.success) {
      alert("تم إرسال طلب الأشعة للمريض بنجاح!");
    } else {
      alert(result.error || "فشل إرسال الطلب.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>
          الروشتات الطبية والتاريخ المرضي
        </h2>
        <button
          onClick={handleRequestXRay}
          disabled={xrayLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "var(--bg-surface)",
            color: "var(--primary)",
            border: "1px solid var(--primary)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-md)",
            cursor: xrayLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
            opacity: xrayLoading ? 0.7 : 1,
          }}
        >
          <ImageIcon size={18} />
          <span>
            {xrayLoading ? "جاري الإرسال..." : "طلب أشعة عبر الواتساب"}
          </span>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: "1.5rem",
        }}
      >
        {/* Write Prescription Form */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}
        >
          <h3
            style={{
              marginBottom: "1rem",
              fontSize: "1.125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Pill size={20} style={{ color: "var(--primary)" }} />
            كتابة روشتة جديدة
          </h3>

          {success && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                color: "var(--success)",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
                border: "1px solid var(--success)",
              }}
            >
              تم حفظ الروشتة وإرسالها بنجاح على واتساب المريض!
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <input type="hidden" name="patientId" value={resolvedParams.id} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                الأدوية والجرعات
              </label>
              <textarea
                name="medications"
                required
                rows={4}
                placeholder="مثال:&#10;1. Augmentin 1gm - قرص كل 12 ساعة بعد الأكل"
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              ></textarea>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                ملاحظات
              </label>
              <textarea
                name="notes"
                rows={2}
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "var(--primary)",
                color: "white",
                border: "none",
                padding: "0.875rem",
                borderRadius: "var(--radius-md)",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Send size={20} />
              <span>{loading ? "جاري الإرسال..." : "حفظ وإرسال للواتساب"}</span>
            </button>
          </form>
        </div>

        {/* Prescription History */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Clock size={20} style={{ color: "var(--text-secondary)" }} />
            تاريخ الروشتات
          </h3>

          {pastPrescriptions.length === 0 ? (
            <div
              style={{
                padding: "2rem 0",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              لا توجد روشتات مسجلة مسبقاً.
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {pastPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  style={{
                    padding: "1rem",
                    backgroundColor: "var(--bg-main)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {new Date(rx.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {rx.medications}
                  </div>
                  {rx.notes && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.5rem",
                        borderTop: "1px dashed var(--border)",
                        paddingTop: "0.5rem",
                      }}
                    >
                      ملاحظات: {rx.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
