import { createClient } from "@/utils/supabase/server";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { markAsArrived, markAsInProgress, collectPayment } from "./actions";

export default async function QueuePage() {
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      id, appointment_date, status, checkup_fee_paid,
      patients (id, full_name, phone),
      profiles (full_name),
      invoices (
        id,
        installments (id, amount_due, amount_paid, status, session_number)
      )
    `,
    )
    .gte("appointment_date", startOfDay.toISOString())
    .lte("appointment_date", endOfDay.toISOString())
    .order("appointment_date", { ascending: true });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            منتظر الوصول
          </span>
        );
      case "Arrived":
        return (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            في الاستراحة
          </span>
        );
      case "In Progress":
        return (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            في الجلسة مع الطبيب
          </span>
        );
      case "Completed":
        return (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "rgba(107, 114, 128, 0.1)",
              color: "#6b7280",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            انتهى
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Users size={28} color="var(--primary)" />
            طابور العيادة (اليوم)
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            إدارة المرضى المتوقع وصولهم والمنتظرين في الاستراحة.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {appointments?.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--border)",
            }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              لا يوجد مواعيد مسجلة لهذا اليوم.
            </p>
          </div>
        ) : (
          appointments?.map((appt: any) => {
            const timeStr = new Date(appt.appointment_date).toLocaleTimeString(
              "ar-EG",
              { hour: "2-digit", minute: "2-digit" },
            );
            return (
              <div
                key={appt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.5rem",
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Info Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                      {appt.patients?.full_name}
                    </h3>
                    {getStatusBadge(appt.status)}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Clock size={16} /> الموعد: {timeStr}
                    </span>
                    <span>📞 {appt.patients?.phone}</span>
                    <span>
                      👨‍⚕️ الطبيب:{" "}
                      {appt.profiles?.full_name
                        ? `د. ${appt.profiles.full_name}`
                        : "أي طبيب متاح"}
                    </span>
                  </div>
                </div>

                {/* Actions Section */}
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  {appt.status === "Scheduled" && (
                    <form
                      action={markAsArrived}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <input
                        type="hidden"
                        name="appointment_id"
                        value={appt.id}
                      />
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="checkup_paid"
                          value="true"
                        />
                        دفع الكشف؟
                      </label>
                      <button
                        type="submit"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          backgroundColor: "var(--primary)",
                          color: "white",
                          border: "none",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={18} />
                        تسجيل الحضور
                      </button>
                    </form>
                  )}

                  {appt.status === "Arrived" && (
                    <form action={markAsInProgress}>
                      <input
                        type="hidden"
                        name="appointment_id"
                        value={appt.id}
                      />
                      <button
                        type="submit"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          backgroundColor: "var(--success)",
                          color: "white",
                          border: "none",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        <PlayCircle size={18} />
                        إدخال للطبيب (بدء الجلسة)
                      </button>
                    </form>
                  )}

                  {appt.status === "In Progress" && (
                    <a
                      href={`/dashboard/patients/${appt.patients.id}/active-session?appointment_id=${appt.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                        padding: "0.5rem 1rem",
                        backgroundColor: "var(--text-primary)",
                        color: "var(--bg-main)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      فتح شاشة الطبيب
                    </a>
                  )}

                  {appt.status === "Completed" &&
                    appt.invoices &&
                    (() => {
                      const unpaidInstallment =
                        appt.invoices.installments?.find(
                          (inst: any) => inst.status === "Unpaid",
                        );
                      if (unpaidInstallment) {
                        return (
                          <form
                            action={collectPayment}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              backgroundColor: "var(--bg-main)",
                              padding: "0.5rem 1rem",
                              borderRadius: "var(--radius-md)",
                              border: "1px dashed var(--border)",
                            }}
                          >
                            <input
                              type="hidden"
                              name="invoice_id"
                              value={appt.invoices.id}
                            />
                            <input
                              type="hidden"
                              name="installment_id"
                              value={unpaidInstallment.id}
                            />
                            <input
                              type="hidden"
                              name="amount"
                              value={unpaidInstallment.amount_due}
                            />

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                المبلغ المستحق الآن
                              </span>
                              <strong
                                style={{
                                  fontSize: "1.1rem",
                                  color: "var(--error)",
                                }}
                              >
                                {unpaidInstallment.amount_due} ج.م
                              </strong>
                            </div>

                            <select
                              name="payment_method"
                              required
                              style={{
                                padding: "0.5rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                fontFamily: "inherit",
                              }}
                            >
                              <option value="Cash">كاش</option>
                              <option value="InstaPay">إنستاباي</option>
                              <option value="VodafoneCash">
                                محفظة إلكترونية
                              </option>
                              <option value="CreditCard">بطاقة بنكية</option>
                            </select>

                            <button
                              type="submit"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 1rem",
                                backgroundColor: "var(--primary)",
                                color: "white",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              <CheckCircle2 size={18} />
                              تأكيد الاستلام
                            </button>
                          </form>
                        );
                      } else {
                        return (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 1rem",
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                              color: "var(--success)",
                              borderRadius: "var(--radius-md)",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            <CheckCircle2 size={18} />
                            تم سداد الدفعات المستحقة
                          </span>
                        );
                      }
                    })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
