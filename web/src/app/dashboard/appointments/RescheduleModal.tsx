"use client";

import { useState } from "react";
import { X, Calendar, MessageCircle } from "lucide-react";
import { rescheduleManually, askPatientToReschedule } from "./actions";

export default function RescheduleModal({
  appointment,
  onClose,
}: {
  appointment: any;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "2rem",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "500px",
          position: "relative",
          border: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <X size={24} />
        </button>

        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "1.5rem",
            color: "var(--text-primary)",
          }}
        >
          تعديل الموعد
        </h2>

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "var(--bg-main)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              المريض: {appointment.patients?.full_name}
            </p>
            <p
              suppressHydrationWarning
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              الموعد الحالي:{" "}
              {new Date(appointment.appointment_date).toLocaleString("ar-EG")}
            </p>
          </div>
          <a
            href={`/dashboard/patients/${appointment.patientId}`}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              color: "var(--primary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            ملف المريض
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Option 1: Manual Reschedule */}
          <form
            action={async (formData) => {
              setLoading(true);
              await rescheduleManually(formData);
              setLoading(false);
              onClose();
            }}
          >
            <input type="hidden" name="appointment_id" value={appointment.id} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                تحديد موعد جديد يدوياً
              </label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="datetime-local"
                  name="new_date"
                  required
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-main)",
                    color: "var(--text-primary)",
                    flex: 1,
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Calendar size={18} /> حفظ والتأكيد
                </button>
              </div>
              <small style={{ color: "var(--text-secondary)" }}>
                * سيتم إرسال رسالة واتساب بالتأكيد للمريض.
              </small>
            </div>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <hr style={{ flex: 1, borderColor: "var(--border)" }} />
            <span
              style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
            >
              أو
            </span>
            <hr style={{ flex: 1, borderColor: "var(--border)" }} />
          </div>

          {/* Option 2: Ask Patient via Bot */}
          <form
            action={async (formData) => {
              setLoading(true);
              await askPatientToReschedule(formData);
              setLoading(false);
              onClose();
            }}
          >
            <input type="hidden" name="appointment_id" value={appointment.id} />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--primary)",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                color: "var(--primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontWeight: 600,
              }}
            >
              <MessageCircle size={20} />
              دع المريض يختار الموعد عبر الواتساب
            </button>
            <small
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "0.5rem",
                color: "var(--text-secondary)",
              }}
            >
              * سيتم إلغاء الموعد الحالي وسيطلب البوت من المريض اختيار موعد
              بديل.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
}
