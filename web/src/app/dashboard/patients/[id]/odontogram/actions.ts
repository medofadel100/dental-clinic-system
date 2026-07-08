"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveOdontogramData(
  patientId: string,
  odontogramData: any,
) {
  const supabase = await createClient();

  // Update the patient's record with the new odontogram data
  const { error } = await supabase
    .from("patients")
    .update({ odontogram_data: odontogramData })
    .eq("id", patientId);

  if (error) {
    console.error("Error saving odontogram:", error);
    throw new Error("فشل حفظ المخطط");
  }

  revalidatePath(`/dashboard/patients/${patientId}/odontogram`);
}
