"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSalary(formData: FormData) {
  const supabase = await createClient();
  const profileId = formData.get("profileId") as string;
  const salarySystem = formData.get("salary_system") as string;
  const salaryValue = parseFloat(formData.get("salary_value") as string) || 0;
  const percentageValue =
    parseFloat(formData.get("percentage_value") as string) || 0;
  const bonusAmount = parseFloat(formData.get("bonus_amount") as string) || 0;
  const deductionAmount =
    parseFloat(formData.get("deduction_amount") as string) || 0;

  await supabase
    .from("profiles")
    .update({
      salary_system: salarySystem,
      salary_value: salaryValue,
      percentage_value: percentageValue,
      bonus_amount: bonusAmount,
      deduction_amount: deductionAmount,
    })
    .eq("id", profileId);

  revalidatePath(`/dashboard/staff`);
  revalidatePath(`/dashboard/reports`);
}

export async function createStaffMember(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;
  const specialization = formData.get("specialization") as string;

  // We need the service_role key to bypass normal auth flow and create users directly
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  // Create auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (authError) {
    console.error("Error creating user:", authError);
    const { redirect } = await import("next/navigation");
    redirect("/dashboard/staff/new?error=exists");
  }

  // The database trigger might have created a default profile with 'Receptionist'.
  // We need to update it with the actual details.
  if (authData.user) {
    await supabaseAdmin.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName,
      role: role,
      phone: phone,
      specialization: specialization,
    });
  }

  revalidatePath(`/dashboard/staff`);
  const { redirect } = await import("next/navigation");
  redirect("/dashboard/staff");
}
