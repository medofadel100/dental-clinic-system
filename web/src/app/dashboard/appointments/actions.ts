"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const getServiceClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function addAppointment(formData: FormData) {
  const supabase = await createClient();

  const patientId = formData.get("patient_id") as string;
  const doctorId = formData.get("doctor_id") as string;
  const rawAppointmentDate = formData.get("appointment_date") as string;
  const isWalkIn = formData.get("is_walk_in") === "true";
  const serviceId = formData.get("service_id") as string;
  const notes = formData.get("notes") as string;

  const finalDate = isWalkIn
    ? new Date().toISOString()
    : new Date(rawAppointmentDate).toISOString();

  if (!patientId || !finalDate) {
    throw new Error("بيانات غير مكتملة");
  }

  let finalPatientId = patientId;
  let patient;

  if (patientId === "NEW_PATIENT") {
    const newName = formData.get("new_patient_name") as string;
    const newPhone = formData.get("new_patient_phone") as string;

    if (!newName || !newPhone)
      throw new Error("بيانات المريض الجديد غير مكتملة");

    // Create the patient first
    const { data: newPatientData, error: newPatientError } = await supabase
      .from("patients")
      .insert({ full_name: newName, phone: newPhone })
      .select()
      .single();

    if (newPatientError) {
      console.error(newPatientError);
      throw new Error(
        "حدث خطأ أثناء تسجيل المريض الجديد (قد يكون الرقم مسجل مسبقاً)",
      );
    }

    finalPatientId = newPatientData.id;
    patient = newPatientData;
  } else {
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("phone, full_name")
      .eq("id", patientId)
      .single();
    patient = existingPatient;
  }
  const { error } = await supabase.from("appointments").insert({
    patient_id: finalPatientId,
    doctor_id: doctorId || null,
    service_id: serviceId || null,
    is_walk_in: isWalkIn,
    appointment_date: finalDate,
    notes: notes || null,
    status: "Scheduled",
  });

  if (error) {
    console.error("Error creating appointment:", error);
    throw new Error("حدث خطأ أثناء حجز الموعد");
  }

  // Send WhatsApp message via bot
  if (patient && patient.phone) {
    try {
      let message = "";
      if (isWalkIn) {
        message = `أهلاً بك أ. ${patient.full_name} في لومينا ديجيتال 🦷\nلقد تم تسجيل دخولك للعيادة الآن.\nيرجى الانتظار في الاستراحة وسيقوم الطبيب باستقبالك في أقرب فرصة.`;
      } else {
        const timeStr = new Date(finalDate).toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateStr = new Date(finalDate).toLocaleDateString("ar-EG");
        message = `تأكيد حجز موعد 📅\nأهلاً أ. ${patient.full_name}،\nتم تأكيد حجز موعدك في لومينا ديجيتال 🦷 يوم ${dateStr} الساعة ${timeStr}.\nنتمنى لك دوام الصحة.`;
      }

      const { error: qError } = await getServiceClient()
        .from("whatsapp_queue")
        .insert({ phone: patient.phone, message });
      if (qError) console.error("Error queueing:", qError);
    } catch (err) {
      console.error("Error queueing WhatsApp notification:", err);
    }
  }

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

export async function rescheduleManually(formData: FormData) {
  const supabase = await createClient();
  const appointmentId = formData.get("appointment_id") as string;
  const newDate = formData.get("new_date") as string;

  if (!appointmentId || !newDate) throw new Error("بيانات غير مكتملة");

  const { data: appointment, error } = await supabase
    .from("appointments")
    .update({ appointment_date: new Date(newDate).toISOString() })
    .eq("id", appointmentId)
    .select("*, patients(phone, full_name)")
    .single();

  if (error || !appointment) throw new Error("حدث خطأ أثناء التعديل");

  if (appointment.patients?.phone) {
    const timeStr = new Date(newDate).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = new Date(newDate).toLocaleDateString("ar-EG");
    const message = `نعتذر منك أ. ${appointment.patients.full_name} 🗓️\nنظراً لظروف طارئة، تم تعديل موعدك ليكون يوم ${dateStr} الساعة ${timeStr}.\nنتمنى لك دوام الصحة.`;

    try {
      const { error: qError } = await getServiceClient()
        .from("whatsapp_queue")
        .insert({ phone: appointment.patients.phone, message });
      if (qError) console.error("Error queueing:", qError);
    } catch (err) {
      console.error(err);
    }
  }

  revalidatePath("/dashboard/appointments");
}

export async function askPatientToReschedule(formData: FormData) {
  const supabase = await createClient();
  const appointmentId = formData.get("appointment_id") as string;

  if (!appointmentId) return;

  // Get appointment details
  const { data: appt } = await supabase
    .from("appointments")
    .select("*, patients(phone, full_name)")
    .eq("id", appointmentId)
    .single();

  if (!appt || !appt.patients?.phone)
    throw new Error("بيانات المريض غير مكتملة");

  // Cancel old appointment
  await supabase
    .from("appointments")
    .update({ status: "Cancelled" })
    .eq("id", appointmentId);

  // Generate suggested slots
  let suggestionText = "يرجى إخباري بالوقت المناسب لك لإعادة جدولته وسأقوم بعرض المواعيد المتاحة.";
  try {
    if (appt.doctor_id) {
      const { data: schedules } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", appt.doctor_id)
        .eq("is_active", true);

      if (schedules && schedules.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
        
        let targetDate = tomorrow;
        let workingSchedule = schedules.find((s: any) => s.day_of_week === targetDate.getDay());
        
        if (!workingSchedule) {
          targetDate = dayAfter;
          workingSchedule = schedules.find((s: any) => s.day_of_week === targetDate.getDay());
        }

        if (workingSchedule) {
          const dateStr = targetDate.toLocaleDateString("ar-EG", { weekday: "long" });
          const start = workingSchedule.start_time.substring(0, 5);
          suggestionText = `من أقرب المواعيد المتاحة مع طبيبك يوم ${dateStr} بداية من الساعة ${start}.\nوإذا لم يكن هذا الوقت مناسباً، يوجد مواعيد أخرى متاحة مع نخبة من أطبائنا الآخرين.\nما هو الوقت واليوم المناسب لك؟`;
        } else {
          suggestionText = "يرجى إخباري بالوقت واليوم المناسب لك لإعادة جدولته وسأقوم بعرض المواعيد المتاحة مع طبيبك، أو يمكنني عرض مواعيد أطباء آخرين إذا رغبت.";
        }
      } else {
        suggestionText = "يرجى إخباري بالوقت واليوم المناسب لك لإعادة جدولته وسأقوم بعرض المواعيد المتاحة مع طبيبك، أو يمكنني عرض مواعيد أطباء آخرين إذا رغبت.";
      }
    }
  } catch (err) {
    console.error("Error generating slot suggestions:", err);
  }

  // Trigger bot flow
  try {
    const message = `نعتذر منك أ. ${appt.patients.full_name} 🗓️\nنظراً لظروف طارئة، تم إلغاء موعدك السابق.\n${suggestionText}`;
    const { error: qError } = await getServiceClient()
      .from("whatsapp_queue")
      .insert({ phone: appt.patients.phone, message });
    if (qError) console.error("Error queueing:", qError);
  } catch (err) {
    console.error(err);
  }

  revalidatePath("/dashboard/appointments");
}
