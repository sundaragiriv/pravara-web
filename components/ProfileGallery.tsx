"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

interface GalleryProps {
  profileId: string;
  editable: boolean; // True if looking at my own profile
}

export default function ProfileGallery({ profileId, editable }: GalleryProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [profileId]);

  const fetchPhotos = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    
    if (data) setPhotos(data);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `gallery/${profileId}/${Math.random()}.${fileExt}`;

      // 1. Upload to Storage (Using 'avatars' bucket for simplicity, or make a new 'gallery' bucket)
      // We will reuse 'avatars' bucket since we already set it up!
      const { error: uploadError } = await supabase.storage
        .from('avatars') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 2. Insert into Database Table
      const { error: dbError } = await supabase
        .from('profile_photos')
        .insert({
            profile_id: profileId,
            image_url: publicUrl
        });

      if (dbError) throw dbError;

      fetchPhotos(); // Refresh grid

    } catch (error) {
      alert("Error uploading photo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Delete this photo?")) return;
    
    const supabase = createClient();
    await supabase.from('profile_photos').delete().eq('id', photoId);
    fetchPhotos();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <h3 className="text-haldi-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Life & Moments
         </h3>
         {editable && (
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs font-bold text-stone-400 hover:text-white flex items-center gap-1 transition-colors"
            >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Plus className="w-3 h-3" />}
                Add Photo
            </button>
         )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Render Photos */}
        {photos.map((photo) => (
            <div key={photo.id} className="aspect-square rounded-xl overflow-hidden relative group bg-stone-900 border border-stone-800">
                <img src={photo.image_url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                
                {/* Delete Button (Only if editable) */}
                {editable && (
                    <button 
                        onClick={() => handleDelete(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        ))}

        {/* Empty State / Add Placeholder */}
        {photos.length === 0 && (
            <div className="col-span-3 py-8 text-center border-2 border-dashed border-stone-800 rounded-xl bg-stone-900/30">
                <p className="text-stone-500 text-sm">No extra photos added yet.</p>
            </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
    </div>
  );
}
