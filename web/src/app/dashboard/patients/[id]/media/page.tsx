import { createClient } from "@/utils/supabase/server";
import { Plus, ImageIcon, FileText } from "lucide-react";
import { uploadMedia } from "./actions";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch media for this patient
  const { data: mediaFiles } = await supabase
    .from("media")
    .select("*")
    .eq("patient_id", resolvedParams.id)
    .order("uploaded_at", { ascending: false });

  // Inline Server Action wrapper so it can access resolvedParams
  async function handleUpload(formData: FormData) {
    "use server";
    await uploadMedia(resolvedParams.id, formData);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>
          الأشعة والملفات (Media & X-Rays)
        </h2>
      </div>

      {/* Upload Form */}
      <div style={{
        padding: "1.5rem", backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
        marginBottom: "2rem"
      }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "var(--text-primary)" }}>رفع ملف جديد</h3>
        <form action={handleUpload} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>نوع الملف</label>
            <select name="media_type" required style={{
              padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit"
            }}>
              <option value="X-Ray">أشعة (X-Ray)</option>
              <option value="Panorama">بانوراما (Panorama)</option>
              <option value="Before Image">صورة قبل (Before)</option>
              <option value="After Image">صورة بعد (After)</option>
              <option value="Other">أخرى (Other)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 2, minWidth: "250px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الملف</label>
            <input type="file" name="file" required accept="image/*,application/pdf" style={{
              padding: "0.6rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontFamily: "inherit", width: "100%"
            }} />
          </div>

          <button type="submit" style={{
            display: "flex", alignItems: "center", gap: "0.5rem", 
            backgroundColor: "var(--primary)", color: "white", 
            border: "none", padding: "0.75rem 1.5rem", borderRadius: "var(--radius-md)", 
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600, height: "42px"
          }}>
            <Plus size={18} />
            <span>رفع وحفظ</span>
          </button>
        </form>
      </div>

      {(!mediaFiles || mediaFiles.length === 0) ? (
        <div style={{ 
          textAlign: "center", padding: "4rem 2rem", 
          backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", 
          border: "1px solid var(--border)", color: "var(--text-muted)" 
        }}>
          <ImageIcon size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <p>لا توجد ملفات أو أشعة مسجلة لهذا المريض.</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" 
        }}>
          {mediaFiles.map((file: any) => (
            <div key={file.id} style={{
              padding: "1rem", backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
              textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem"
            }}>
              <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                {file.url.endsWith('.pdf') ? (
                  <div style={{
                    width: "100%", height: "150px", backgroundColor: "var(--bg-main)",
                    borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <FileText size={32} style={{ color: "var(--text-muted)" }} />
                  </div>
                ) : (
                  <img src={file.url} alt={file.media_type} style={{
                    width: "100%", height: "150px", objectFit: "cover",
                    borderRadius: "var(--radius-md)"
                  }} />
                )}
              </a>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>{file.media_type}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                {new Date(file.uploaded_at).toLocaleDateString('ar-EG')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
