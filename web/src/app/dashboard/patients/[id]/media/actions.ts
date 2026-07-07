'use server'

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMedia(patientId: string, formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const mediaType = formData.get('media_type') as string;

    if (!file) {
      return { error: 'برجاء اختيار ملف' };
    }

    // Convert file to base64 or buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64Data}`;

    // Upload to Cloudinary under the "dental-clinic" folder
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: `dental-clinic/patients/${patientId}`,
      resource_type: 'auto', // supports images, pdfs, etc
    });

    const fileUrl = uploadResult.secure_url;

    // Save metadata in Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('media').insert([
      {
        patient_id: patientId,
        url: fileUrl,
        media_type: mediaType,
      },
    ]);

    if (dbError) {
      console.error("Supabase error:", dbError);
      return { error: 'فشل حفظ بيانات الملف في قاعدة البيانات' };
    }

    revalidatePath(`/dashboard/patients/${patientId}/media`);
    return { success: true };
  } catch (error) {
    console.error('Upload Error:', error);
    return { error: 'حصلت مشكلة أثناء رفع الملف' };
  }
}
