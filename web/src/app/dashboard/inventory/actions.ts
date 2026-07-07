'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInventoryQuantity(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("itemId") as string;
  const quantityChange = parseInt(formData.get("quantity_change") as string) || 0;
  const action = formData.get("action") as string; // 'add' or 'subtract'

  if (quantityChange <= 0) return;

  // First fetch current quantity
  const { data: item } = await supabase.from('inventory').select('quantity').eq('id', itemId).single();
  if (!item) return;

  const newQuantity = action === 'add' 
    ? item.quantity + quantityChange 
    : Math.max(0, item.quantity - quantityChange);

  await supabase.from("inventory").update({
    quantity: newQuantity
  }).eq("id", itemId);

  revalidatePath(`/dashboard/inventory`);
  revalidatePath(`/dashboard`); // To update alerts on dashboard
}

export async function addInventoryItem(formData: FormData) {
  const supabase = await createClient();
  
  const itemName = formData.get("item_name") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const unit = formData.get("unit") as string;
  const minStock = parseInt(formData.get("minimum_stock_level") as string) || 10;
  const expiration = formData.get("expiration_date") as string;

  if (!itemName || !unit) {
    throw new Error('الرجاء إدخال اسم الصنف والوحدة');
  }

  const { error } = await supabase.from('inventory').insert({
    item_name: itemName,
    quantity: quantity,
    unit: unit,
    minimum_stock_level: minStock,
    expiration_date: expiration ? expiration : null
  });

  if (error) {
    console.error("Error adding inventory item:", error);
    throw new Error('حدث خطأ أثناء إضافة الصنف');
  }

  revalidatePath(`/dashboard/inventory`);
  revalidatePath(`/dashboard`);
}
