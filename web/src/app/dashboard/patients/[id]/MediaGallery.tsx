import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import styles from "./patient.module.css";

export default async function MediaGallery({ patientId }: { patientId: string }) {
  const supabase = await createClient();
  const { data: mediaFiles } = await supabase
    .from("media")
    .select("*")
    .eq("patient_id", patientId)
    .order("uploaded_at", { ascending: false });

  if (!mediaFiles || mediaFiles.length === 0) {
    return <p className={styles.placeholderText}>لا توجد صور أو ملفات أشعة.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
      {mediaFiles.map((media) => (
        <div key={media.id} style={{ 
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', 
          backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '150px', backgroundColor: '#e5e7eb' }}>
            <Image 
              src={media.url} 
              alt="صورة أشعة" 
              fill 
              style={{ objectFit: 'cover' }} 
              unoptimized // Allow local files from /uploads without next/image remote config for now
            />
          </div>
          <div style={{ padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {new Date(media.uploaded_at).toLocaleDateString('ar-EG')}
          </div>
        </div>
      ))}
    </div>
  );
}
