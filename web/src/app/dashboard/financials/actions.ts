"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveExpense(formData: FormData) {
  const supabase = await createClient();

  const data = {
    amount: parseFloat(formData.get("amount") as string),
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    payment_method: formData.get("payment_method") as string,
    receipt_number: formData.get("receipt_number") as string,
  };

  const { error } = await supabase.from("expenses").insert([
    {
      category: data.category,
      amount: data.amount,
      description: data.description || null,
      payment_method: data.payment_method || null,
      receipt_number: data.receipt_number || null,
    },
  ]);

  if (error) {
    console.error(error);
    throw new Error("فشل تسجيل المصروف");
  }

  revalidatePath("/dashboard/financials");
  redirect("/dashboard/financials");
}
