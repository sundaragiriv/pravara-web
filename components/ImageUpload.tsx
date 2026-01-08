"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
    bucket: 'avatars' | 'gallery' | 'documents';
    currentImage?: string;
    onUploadComplete: (url: string) => void;
    label?: string;
    shape?: 'circle' | 'square' | 'wide';
}

export default function ImageUpload({ bucket, currentImage, onUploadComplete, label, shape = 'square' }: ImageUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            // 1. Unique File Path: userId/timestamp.ext
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

            // 2. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // 4. Update UI & Parent
            setPreview(publicUrl);
            onUploadComplete(publicUrl);

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // STYLES based on Shape
    const containerClasses = {
        circle: "w-32 h-32 rounded-full",
        square: "w-full aspect-square rounded-2xl",
        wide: "w-full h-48 rounded-2xl"
    };

    return (
        <div className="relative group">
            <div className={`relative overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center ${containerClasses[shape]}`}>
                
                {/* PREVIEW or PLACEHOLDER */}
                {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Upload" />
                ) : (
                    <div className="text-stone-600 flex flex-col items-center">
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">{label || "Upload"}</span>
                    </div>
                )}

                {/* LOADING SPINNER */}
                {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
                    </div>
                )}

                {/* HIDDEN INPUT & OVERLAY */}
                <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUpload} 
                        className="hidden" 
                        disabled={uploading}
                    />
                    {!uploading && preview && (
                        <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-xs bg-black/50 px-3 py-1 rounded-full border border-white/20">
                            Change Photo
                        </span>
                    )}
                </label>
            </div>
        </div>
    );
}
