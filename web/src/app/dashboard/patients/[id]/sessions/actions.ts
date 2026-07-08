"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSession(formData: FormData) {
  const supabase = await createClient();

  const patientId = formData.get("patient_id") as string;
  const serviceId = formData.get("service_id") as string;
  const discountType = formData.get("discount_type") as string;
  const discountValue =
    parseFloat(formData.get("discount_value") as string) || 0;
  const notes = formData.get("notes") as string;

  const appointmentId = formData.get("appointment_id") as string;

  if (!patientId || !serviceId) {
    throw new Error("بيانات غير مكتملة");
  }

  // Fetch the service base price
  const { data: service } = await supabase
    .from("services_catalog")
    .select("base_price")
    .eq("id", serviceId)
    .single();
  if (!service) throw new Error("الخدمة غير موجودة");

  let sessionCost = parseFloat(service.base_price);
  let finalDiscount = 0;

  if (
    discountType === "Percentage" &&
    discountValue > 0 &&
    discountValue <= 100
  ) {
    finalDiscount = sessionCost * (discountValue / 100);
  } else if (discountType === "Fixed" && discountValue > 0) {
    finalDiscount = discountValue;
  }

  sessionCost = Math.max(0, sessionCost - finalDiscount);

  // 1. Create Session
  const sessionData: any = {
    patient_id: patientId,
    service_id: serviceId,
    discount_type: discountType || null,
    discount_value: discountValue,
    session_cost: sessionCost,
    notes: notes,
  };

  if (appointmentId) {
    sessionData.appointment_id = appointmentId;
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select()
    .single();

  if (sessionError || !session) {
    console.error("Error creating session:", sessionError);
    throw new Error("حدث خطأ أثناء حفظ الجلسة");
  }

  // 2. Create Invoice
  const { error: invoiceError } = await supabase.from("invoices").insert({
    patient_id: patientId,
    session_id: session.id,
    amount_due: sessionCost,
    amount_paid: 0,
    status: sessionCost === 0 ? "Paid" : "Unpaid",
  });

  if (invoiceError) {
    console.error("Error creating invoice:", invoiceError);
  }

  // 3. Update Appointment Status
  if (appointmentId) {
    const { error: apptError } = await supabase
      .from("appointments")
      .update({ status: "Completed" })
      .eq("id", appointmentId);

    if (apptError) {
      console.error("Error updating appointment status:", apptError);
    }
  }

  revalidatePath(`/dashboard/patients/${patientId}/sessions`);
  revalidatePath(`/dashboard/patients/${patientId}`);
  revalidatePath(`/dashboard`);
}
