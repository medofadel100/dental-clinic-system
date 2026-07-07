'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTreatmentPlan(formData: FormData) {
  const supabase = await createClient();
  
  const patientId = formData.get("patient_id") as string;
  const name = formData.get("name") as string;
  const totalCost = parseFloat(formData.get("total_cost") as string) || 0;

  if (!patientId || !name) {
    throw new Error('بيانات غير مكتملة');
  }

  const { error } = await supabase.from('treatment_plans').insert({
    patient_id: patientId,
    name: name,
    total_cost: totalCost,
    status: 'Active'
  });

  if (error) {
    console.error("Error creating treatment plan:", error);
    throw new Error('حدث خطأ أثناء إضافة الخطة');
  }

  revalidatePath(`/dashboard/patients/${patientId}/treatments`);
}
