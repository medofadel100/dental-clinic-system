import { createClient } from "@/utils/supabase/server";
import { updatePatientProfile } from "../actions";
import { AlertCircle, Save } from "lucide-react";

export default async function MedicalHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, medical_history, medical_alerts")
    .eq("id", resolvedParams.id)
    .single();

  if (!patient) return <div>المريض غير موجود</div>;

  const defaultHistory = {
    diabetes: false,
    hypertension: false,
    allergies: "",
    current_medications: "",
    bleeding_disorders: false,
    heart_disease: false,
    pregnancy: false,
  };

  const history =
    patient.medical_history && typeof patient.medical_history === "object"
      ? { ...defaultHistory, ...patient.medical_history }
      : defaultHistory;

  return (
    <div>
      <h2
        style={{
          fontSize: "1.25rem",
          marginBottom: "1.5rem",
          color: "var(--text-primary)",
        }}
      >
        التاريخ الطبي والتحذيرات
      </h2>

      <form
        action={updatePatientProfile}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: "800px",
        }}
      >
        <input type="hidden" name="patient_id" value={patient.id} />

        {/* Medical Alerts (High Priority) */}
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.05)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--error)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--error)",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            <AlertCircle size={20} />
            تحذيرات طبية هامة (Medical Alerts)
          </label>
          <textarea
            name="medical_alerts"
            defaultValue={patient.medical_alerts || ""}
            placeholder="مثال: حساسية شديدة للبنسلين، مريض قلب مركب دعامة..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              minHeight: "80px",
              backgroundColor: "var(--bg-white)",
            }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              marginTop: "0.25rem",
            }}
          >
            سيظهر هذا التحذير بشكل بارز في ملف المريض لتنبيه الطبيب.
          </p>
        </div>

        {/* Detailed Medical History */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "1rem",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
              الأمراض المزمنة
            </h3>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="mh_diabetes"
                defaultChecked={history.diabetes}
              />
              مرض السكري (Diabetes)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="mh_hypertension"
                defaultChecked={history.hypertension}
              />
              ارتفاع ضغط الدم (Hypertension)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="mh_heart_disease"
                defaultChecked={history.heart_disease}
              />
              أمراض القلب (Heart Disease)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="mh_bleeding_disorders"
                defaultChecked={history.bleeding_disorders}
              />
              سيولة في الدم (Bleeding Disorders)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="mh_pregnancy"
                defaultChecked={history.pregnancy}
              />
              حمل / رضاعة (للإناث)
            </label>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1rem",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                حساسية الأدوية (Allergies)
              </label>
              <textarea
                name="mh_allergies"
                defaultValue={history.allergies}
                placeholder="لا يوجد"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  minHeight: "60px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                الأدوية الحالية (Current Medications)
              </label>
              <textarea
                name="mh_current_medications"
                defaultValue={history.current_medications}
                placeholder="لا يوجد"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  minHeight: "60px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Client-side script to pack the checkboxes and textareas into the JSON field before submit */}
        <input type="hidden" name="medical_history" id="medical_history_json" />

        <button
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 600,
            width: "fit-content",
          }}
          onClick={(e) => {
            const form = e.currentTarget.closest("form");
            if (form) {
              const data = {
                diabetes: (
                  form.elements.namedItem("mh_diabetes") as HTMLInputElement
                ).checked,
                hypertension: (
                  form.elements.namedItem("mh_hypertension") as HTMLInputElement
                ).checked,
                heart_disease: (
                  form.elements.namedItem(
                    "mh_heart_disease",
                  ) as HTMLInputElement
                ).checked,
                bleeding_disorders: (
                  form.elements.namedItem(
                    "mh_bleeding_disorders",
                  ) as HTMLInputElement
                ).checked,
                pregnancy: (
                  form.elements.namedItem("mh_pregnancy") as HTMLInputElement
                ).checked,
                allergies: (
                  form.elements.namedItem("mh_allergies") as HTMLTextAreaElement
                ).value,
                current_medications: (
                  form.elements.namedItem(
                    "mh_current_medications",
                  ) as HTMLTextAreaElement
                ).value,
              };
              (
                form.elements.namedItem("medical_history") as HTMLInputElement
              ).value = JSON.stringify(data);
            }
          }}
        >
          <Save size={20} />
          حفظ البيانات الطبية
        </button>
      </form>
    </div>
  );
}
