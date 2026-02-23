"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const MAX_PHOTOS = 8;

interface GalleryProps {
  profileId: string;
  editable: boolean;
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: { id: string; image_url: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        title="Close"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-stone-900 rounded-full border border-stone-800 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-stone-400 bg-stone-900/80 px-3 py-1 rounded-full border border-stone-800">
        {idx + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          type="button"
          title="Previous photo"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 p-2 text-stone-400 hover:text-white bg-stone-900/80 rounded-full border border-stone-800 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Image */}
      <img
        src={photos[idx].image_url}
        alt={`Photo ${idx + 1}`}
        className="max-h-[88vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {photos.length > 1 && (
        <button
          type="button"
          title="Next photo"
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 p-2 text-stone-400 hover:text-white bg-stone-900/80 rounded-full border border-stone-800 transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ProfileGallery({ profileId, editable }: GalleryProps) {
  const [photos, setPhotos] = useState<{ id: string; image_url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  // Per-photo delete confirmation state (stores photo id being confirmed)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPhotos(); }, [profileId]);

  const fetchPhotos = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profile_photos")
      .select("id, image_url")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true });
    if (data) setPhotos(data);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    try {
      setUploading(true);
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `gallery/${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("profile_photos")
        .insert({ profile_id: profileId, image_url: publicUrl });
      if (dbError) throw dbError;

      fetchPhotos();
      toast.success("Photo added!");
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    setConfirmDeleteId(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profile_photos")
      .delete()
      .eq("id", photoId);
    if (error) {
      toast.error("Could not delete photo.");
    } else {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Photo removed.");
    }
  };

  const atLimit = photos.length >= MAX_PHOTOS;

  return (
    <>
      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-haldi-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Life &amp; Moments
          </h3>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${atLimit ? "text-red-400" : "text-stone-500"}`}>
              {photos.length} / {MAX_PHOTOS}
            </span>
            {editable && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || atLimit}
                title={atLimit ? `Maximum ${MAX_PHOTOS} photos reached` : "Add photo"}
                className="text-xs font-bold text-stone-400 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Plus className="w-3 h-3" />
                }
                Add Photo
              </button>
            )}
          </div>
        </div>

        {/* Photo grid — aspect-[4/5] preserves portrait photos */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative group rounded-xl overflow-hidden border border-stone-800 bg-stone-900 aspect-[4/5]"
              >
                {/* Photo — click to open lightbox */}
                <img
                  src={photo.image_url}
                  alt={`Gallery photo ${i + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                  onClick={() => setLightboxIdx(i)}
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setLightboxIdx(i)}
                />

                {/* Delete — only if editable */}
                {editable && (
                  <div className="absolute top-2 right-2 z-10">
                    {confirmDeleteId === photo.id ? (
                      /* Inline confirmation */
                      <div
                        className="flex items-center gap-1.5 bg-stone-950/95 border border-red-800/60 rounded-lg px-2 py-1 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id)}
                          className="text-[10px] text-red-400 font-bold hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                        <span className="text-stone-700">|</span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] text-stone-400 hover:text-white transition-colors"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(photo.id); }}
                        className="p-1.5 bg-stone-950/80 text-stone-400 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-stone-800/60"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-3 py-8 text-center border-2 border-dashed border-stone-800 rounded-xl bg-stone-900/30">
            <ImageIcon className="w-6 h-6 mx-auto mb-2 text-stone-700" />
            <p className="text-stone-500 text-sm">
              {editable ? "Add photos to show your life & moments." : "No extra photos added yet."}
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
          title="Upload gallery photo"
          aria-label="Upload gallery photo"
        />
      </div>
    </>
  );
}
