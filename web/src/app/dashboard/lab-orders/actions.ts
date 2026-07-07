'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLabOrder(formData: FormData) {
  const supabase = await createClient();
  
  const patientId = formData.get("patient_id") as string;
  const doctorId = formData.get("doctor_id") as string;
  const labName = formData.get("lab_name") as string;
  const workDescription = formData.get("work_description") as string;
  const sentDate = formData.get("sent_date") as string;
  const expectedReturnDate = formData.get("expected_return_date") as string;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const notes = formData.get("notes") as string;

  const { error } = await supabase.from("lab_orders").insert([{
    patient_id: patientId || null,
    doctor_id: doctorId || null,
    lab_name: labName,
    work_description: workDescription,
    sent_date: sentDate,
    expected_return_date: expectedReturnDate || null,
    cost: cost,
    notes: notes || null,
    status: 'Pending'
  }]);

  if (error) {
    console.error("Error creating lab order:", error);
    throw new Error("حدث خطأ أثناء حفظ طلب المعمل");
  }

  revalidatePath("/dashboard/lab-orders");
}

export async function updateLabOrderStatus(orderId: string, status: string, actualReturnDate?: string) {
  const supabase = await createClient();
  
  const updateData: any = { status };
  if (actualReturnDate) {
    updateData.actual_return_date = actualReturnDate;
  }

  const { error } = await supabase.from("lab_orders").update(updateData).eq("id", orderId);

  if (error) {
    console.error("Error updating lab order:", error);
    throw new Error("حدث خطأ أثناء التحديث");
  }

  revalidatePath("/dashboard/lab-orders");
}
