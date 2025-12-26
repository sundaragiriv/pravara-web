"use client";

import { useState, useRef } from "react";
import { Mic, Square, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function VoiceRecorder({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Try to use a standard mime type
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic Error:", err);
      alert("Microphone Error: " + err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    setUploading(true);
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Define Filename
      const fileName = `${user.id}-${Date.now()}.webm`;
      console.log("Attempting upload:", fileName);

      // 2. Upload to Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio_bios')
        .upload(fileName, audioBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError);
        throw new Error("Storage permission denied. Check RLS policies.");
      }

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio_bios')
        .getPublicUrl(fileName);

      console.log("File uploaded. URL:", publicUrl);

      // 4. Save to Database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ audio_bio_url: publicUrl })
        .eq('id', user.id);

      if (dbError) {
        console.error("DB Update Error:", dbError);
        throw new Error("Database update failed.");
      }

      alert("Success! Audio Saved.");
      onUploadComplete(publicUrl);

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-[10px] font-bold text-haldi-500 uppercase tracking-widest">Dhvani Bio</div>
            <div className="font-serif text-xl text-stone-100">Voice Intro</div>
          </div>
          {recording && <div className="animate-pulse text-red-500 text-xs font-bold">● Recording</div>}
      </div>

      {!audioUrl && !recording && (
        <button onClick={startRecording} className="w-full py-8 border-2 border-dashed border-stone-700 hover:border-haldi-500 rounded-xl flex flex-col items-center gap-2 text-stone-500 hover:text-stone-300 transition-all">
            <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center"><Mic className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase tracking-widest">Click to Record (30s)</span>
        </button>
      )}

      {recording && (
        <div className="flex justify-center py-6">
            <button onClick={stopRecording} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold flex items-center gap-2">
                <Square className="w-4 h-4 fill-current" /> Stop
            </button>
        </div>
      )}

      {audioUrl && (
        <div className="space-y-4">
            <audio src={audioUrl} controls className="w-full" />
            <div className="flex gap-2">
                <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="flex-1 py-3 bg-stone-800 text-stone-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-stone-700"><Trash2 className="w-4 h-4" /> Retry</button>
                <button onClick={uploadAudio} disabled={uploading} className="flex-1 py-3 bg-haldi-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-haldi-500">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Save
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
