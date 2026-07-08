"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addService(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const basePrice = parseFloat(formData.get("base_price") as string);

  if (!name || isNaN(basePrice)) {
    throw new Error("بيانات غير صحيحة");
  }

  const { error } = await supabase.from("services_catalog").insert({
    name,
    base_price: basePrice,
  });

  if (error) {
    console.error("Error adding service:", error);
    throw new Error("حدث خطأ أثناء إضافة الخدمة");
  }

  revalidatePath("/dashboard/settings/services");
}

export async function deleteService(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) return;

  const { error } = await supabase
    .from("services_catalog")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting service:", error);
    throw new Error("لا يمكن حذف الخدمة، قد تكون مستخدمة في جلسات سابقة.");
  }

  revalidatePath("/dashboard/settings/services");
}

export async function editService(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const basePrice = parseFloat(formData.get("base_price") as string);

  if (!id || !name || isNaN(basePrice)) return;

  const { error } = await supabase
    .from("services_catalog")
    .update({
      name,
      base_price: basePrice,
    })
    .eq("id", id);

  if (error) {
    console.error("Error editing service:", error);
    throw new Error("حدث خطأ أثناء تعديل الخدمة.");
  }

  revalidatePath("/dashboard/settings/services");
}
