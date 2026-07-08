import Odontogram from "@/components/Odontogram";
import { saveOdontogramData } from "./actions";
import { createClient } from "@/utils/supabase/server";

export default async function OdontogramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch patient to get existing odontogram data
  const { data: patient } = await supabase
    .from("patients")
    .select("odontogram_data")
    .eq("id", resolvedParams.id)
    .single();

  const initialData = patient?.odontogram_data || {};

  // Wrapper function for the server action to pass the patientId
  const handleSave = async (data: any) => {
    "use server";
    await saveOdontogramData(resolvedParams.id, data);
  };

  return (
    <div>
      <h2
        style={{
          fontSize: "1.25rem",
          marginBottom: "1.5rem",
          color: "var(--text-primary)",
        }}
      >
        مخطط الأسنان التفصيلي
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        اختر الحالة من الشريط، ثم اضغط على السن لتغيير حالته.
      </p>

      <Odontogram initialData={initialData} onSave={handleSave} />
    </div>
  );
}
