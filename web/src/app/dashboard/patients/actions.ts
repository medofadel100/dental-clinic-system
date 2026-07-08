"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPatient(formData: FormData) {
  const supabase = await createClient();

  const data = {
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    medical_history: formData.get("medical_history") as string,
  };

  const { error } = await supabase.from("patients").insert([data]);

  if (error) {
    console.error(error);
    return {
      error:
        "حصلت مشكلة أثناء تسجيل المريض. تأكد إن رقم التليفون مش متسجل قبل كده.",
    };
  }

  revalidatePath("/dashboard/patients");
  redirect("/dashboard/patients");
}

export async function getPatients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
