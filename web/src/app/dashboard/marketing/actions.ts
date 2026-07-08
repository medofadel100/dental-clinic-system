"use server";

import { createClient } from "@/utils/supabase/server";

export async function sendBroadcastMessage(formData: FormData) {
  const message = formData.get("message") as string;

  if (!message || message.trim() === "") {
    return { error: "الرجاء كتابة رسالة" };
  }

  try {
    const res = await fetch("http://localhost:4000/api/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "فشل إرسال الرسائل");
    }

    return { success: true, sentCount: data.sentCount, total: data.total };
  } catch (error: any) {
    console.error("Broadcast Error:", error);
    return { error: "حدث خطأ أثناء الاتصال بسيرفر الواتساب. تأكد من عمله." };
  }
}
