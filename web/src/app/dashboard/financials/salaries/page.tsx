import { redirect } from "next/navigation";

export default function SalariesRedirect() {
  redirect("/dashboard/financials?exp_cat=Salary");
}
