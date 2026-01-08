"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Camera, UploadCloud } from "lucide-react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  size?: number; // Size in pixels (e.g. 150)
}

export default function AvatarUpload({ currentUrl, onUploadComplete, size = 120 }: AvatarUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      
      // 1. GET USER ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      // 2. PREPARE FILE PATH (Folder = UserID, File = Date-Hash)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 3. UPLOAD TO SUPABASE STORAGE
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 4. GET PUBLIC URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 5. UPDATE PROFILE TABLE
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ image_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 6. UPDATE UI
      setAvatarUrl(publicUrl);
      onUploadComplete(publicUrl);

    } catch (error: any) {
      alert("Error uploading avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }} onClick={() => fileInputRef.current?.click()}>
      
      {/* THE IMAGE CIRCLE */}
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-700 group-hover:border-haldi-500 transition-colors bg-stone-900 relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-600">
             <Camera className="w-1/3 h-1/3" />
          </div>
        )}
        
        {/* OVERLAY ON HOVER */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <UploadCloud className="w-6 h-6 text-white" />
        </div>

        {/* LOADING SPINNER */}
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
  );
}
