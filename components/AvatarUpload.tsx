"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Camera, UploadCloud } from "lucide-react";
import PhotoCropModal from "@/components/PhotoCropModal";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  size?: number;
}

export default function AvatarUpload({ currentUrl, onUploadComplete, size = 120 }: AvatarUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  // Crop modal state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // Step 1 — user picks a file: read it and show crop modal
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Reset so same file can be re-selected if user cancels
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = () => setRawImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Step 2 — user confirms crop: upload the cropped Blob
  const handleCropComplete = async (blob: Blob) => {
    setRawImageSrc(null);   // close modal
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: "image/jpeg", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ image_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setAvatarUrl(publicUrl);
      onUploadComplete(publicUrl);
      toast.success("Profile photo updated!");

    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Crop modal — shown after file is selected */}
      {rawImageSrc && (
        <PhotoCropModal
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setRawImageSrc(null)}
        />
      )}

      {/* Avatar circle — click to trigger file picker */}
      <div
        className="relative group cursor-pointer"
        style={{ width: size, height: size }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-700 group-hover:border-haldi-500 transition-colors bg-stone-900 relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-600">
              <Camera className="w-1/3 h-1/3" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-white" />
          </div>

          {/* Upload spinner */}
          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
      </div>
    </>
  );
}
