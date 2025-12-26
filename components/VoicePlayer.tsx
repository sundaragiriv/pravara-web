"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function VoicePlayer({ audioUrl }: { audioUrl: string | null }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  if (!audioUrl) return null; // Don't show anything if no voice bio exists

  return (
    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-950 border border-haldi-900/40 flex items-center gap-4 shadow-lg shadow-black/40">
      
      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 flex items-center justify-center transition-all shadow-md shadow-haldi-900/20 flex-shrink-0"
      >
        {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      {/* The "Waveform" Visualizer */}
      <div className="flex-1 flex flex-col justify-center">
         <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-haldi-500 uppercase tracking-widest">Dhvani Intro</span>
            <Volume2 className={`w-3 h-3 ${playing ? 'text-haldi-500 animate-pulse' : 'text-stone-600'}`} />
         </div>
         
         {/* Animated Bars */}
         <div className="flex items-center gap-1 h-8 overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-300 ${playing ? 'bg-haldi-500' : 'bg-stone-800'}`}
                  style={{ 
                    height: playing ? `${Math.max(20, Math.random() * 100)}%` : '20%',
                    animation: playing ? `bounce 0.5s infinite ${i * 0.05}s` : 'none'
                  }}
                />
            ))}
         </div>
      </div>
    </div>
  );
}
