"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; 
import { User, MapPin, Loader2, Save, Mic, Video, ShieldCheck, Trash2, Sliders, Eye, EyeOff, Camera, ArrowLeft, Users, HeartHandshake, Sparkles } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function MyProfilePage() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    
    // Updated: Added 'family' to the allowed tabs
    const [activeTab, setActiveTab] = useState<'details' | 'media' | 'family' | 'preferences'>('details');

    // Form States (Enriched with Family Data)
    const [formData, setFormData] = useState<any>({});
    
    // Preferences State
    const [prefs, setPrefs] = useState({
        age_range: [21, 35],
        height_min: "5'0\"",
        diet: [] as string[],
        community: [] as string[]
    });

    useEffect(() => { 
        fetchProfile();
        // Check URL params for tab navigation
        const tab = searchParams.get('tab');
        if (tab && ['details', 'media', 'family', 'preferences'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setProfile(data);
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                bio: data.bio || '',
                location: data.location || '',
                profession: data.profession || '',
                is_visible: data.is_visible ?? true,
                // --- NEW FAMILY FIELDS ---
                father_occupation: data.father_occupation || '',
                mother_occupation: data.mother_occupation || '',
                family_native: data.family_native || '',
                siblings: data.siblings || '0',
                profile_manager: data.profile_manager || 'Self'
            });
            
            if (data.partner_preferences) {
                try {
                    const p = typeof data.partner_preferences === 'string' ? JSON.parse(data.partner_preferences) : data.partner_preferences;
                    setPrefs({
                        age_range: p.age_range || [21, 35],
                        height_min: p.height_min || "5'0\"",
                        diet: p.diet || [],
                        community: p.community || []
                    });
                } catch (e) { console.error("Error parsing prefs", e); }
            }
        }
        setLoading(false);
    };

    // --- HANDLERS ---
    const handleAvatarUpdate = async (url: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        await supabase.from('profiles').update({ image_url: url }).eq('id', user.id);
        setProfile((prev: any) => ({ ...prev, image_url: url }));
    };

    const handleGalleryAdd = async (url: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        const newGallery = [...(profile.gallery_images || []), url];
        await supabase.from('profiles').update({ gallery_images: newGallery }).eq('id', user.id);
        setProfile((prev: any) => ({ ...prev, gallery_images: newGallery }));
    };

    const removeGalleryImage = async (index: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        const newGallery = profile.gallery_images.filter((_: any, idx: number) => idx !== index);
        await supabase.from('profiles').update({ gallery_images: newGallery }).eq('id', user.id);
        setProfile((prev: any) => ({ ...prev, gallery_images: newGallery }));
    }

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({
                ...formData,
                partner_preferences: prefs 
            }).eq('id', user.id);
            alert("Profile Updated Successfully!");
        }
        setSaving(false);
    };

    const togglePref = (category: 'diet' | 'community', value: string) => {
        setPrefs(prev => {
            const list = prev[category];
            if (list.includes(value)) return { ...prev, [category]: list.filter(i => i !== value) };
            return { ...prev, [category]: [...list, value] };
        });
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-haldi-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto p-6 pb-20">
            
            {/* --- BACK BUTTON --- */}
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium group">
                    <div className="p-2 rounded-full bg-stone-900 border border-stone-800 group-hover:border-stone-600 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Dashboard
                </Link>
            </div>

            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-stone-800 pb-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-white">Edit Profile</h1>
                    <div className="flex gap-6 mt-6 overflow-x-auto">
                        {['details', 'media', 'family', 'preferences'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)} 
                                className={`pb-2 text-sm font-bold border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-haldi-500 text-haldi-500' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                            >
                                {tab === 'family' ? 'Kutumba & Family' : tab}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-haldi-500 hover:bg-haldi-600 text-black font-bold px-6 py-2 rounded-full transition-all disabled:opacity-50 mt-4 md:mt-0 shadow-lg shadow-haldi-500/20">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
            </div>

            {/* === TAB 1: MY DETAILS === */}
            {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${formData.is_visible ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                {formData.is_visible ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                            </div>
                            <div>
                                <h4 className="text-stone-200 font-bold text-sm">Profile Visibility</h4>
                                <p className="text-stone-500 text-xs">{formData.is_visible ? "Visible to matches." : "Hidden from search."}</p>
                            </div>
                        </div>
                        <button onClick={() => setFormData({...formData, is_visible: !formData.is_visible})} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.is_visible ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-haldi-500 text-black'}`}>
                            {formData.is_visible ? "Hide" : "Unhide"}
                        </button>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">First Name</label>
                            <input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Last Name</label>
                            <input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">About Me</label>
                            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-stone-500" />
                                <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 pl-10 text-white focus:border-haldi-500 outline-none transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Profession</label>
                            <input value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none transition-colors" />
                        </div>
                    </div>
                </div>
            )}

            {/* === TAB 2: PHOTOS & MEDIA (Enriched!) === */}
            {activeTab === 'media' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* VARAAHI PROTECTION CARD (Identity) - NEW */}
                    <div className="md:col-span-3 bg-gradient-to-r from-green-900/30 to-stone-900 border border-green-800/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="w-32 h-32 text-green-400" /></div>
                        <div className="z-10 bg-black/40 p-4 rounded-full border border-green-500/30">
                            <ShieldCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="flex-1 z-10">
                            <h3 className="text-lg font-serif text-white flex items-center gap-2">Varaahi Protection <span className="text-[10px] bg-green-900 text-green-400 px-2 py-0.5 rounded border border-green-700 font-sans font-bold uppercase tracking-wider">Secure</span></h3>
                            <p className="text-stone-400 text-sm mt-1 max-w-xl">
                                Verify your identity with Aadhar/Passport. This builds trust and gets you the "Verified Badge" on your profile. Documents are encrypted.
                            </p>
                        </div>
                        <div className="w-full md:w-48 z-10">
                             <ImageUpload bucket="documents" shape="wide" label="Upload ID Document" onUploadComplete={() => alert("Document Sent for Verification")} />
                        </div>
                    </div>

                    {/* Profile & Gallery */}
                    <div className="md:col-span-1 bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col items-center text-center">
                        <h3 className="text-stone-300 font-bold text-sm mb-4">Profile Photo</h3>
                        <ImageUpload bucket="avatars" shape="circle" currentImage={profile.image_url} onUploadComplete={handleAvatarUpdate} label="Upload Face" />
                    </div>

                    <div className="md:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <h3 className="text-stone-300 font-bold text-sm mb-4">Gallery (Life & Moments)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(profile.gallery_images || []).map((img: string, idx: number) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-800">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-black/70 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                            <div className="aspect-square">
                                <ImageUpload bucket="gallery" shape="square" label="Add Photo" onUploadComplete={handleGalleryAdd} />
                            </div>
                        </div>
                    </div>

                    {/* MEDIA STUDIO (Voice & Video) - NEW */}
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex items-center gap-4 hover:border-haldi-500/50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-haldi-500/10 flex items-center justify-center text-haldi-500 group-hover:bg-haldi-500 group-hover:text-black transition-all">
                                <Mic className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Voice Intro</h4>
                                <div className="flex items-center gap-1 mt-1 h-3">
                                    {[1,2,3,4,2,5,3,2].map((h, i) => <div key={i} className={`w-1 bg-stone-600 rounded-full group-hover:bg-haldi-500/50 transition-colors`} style={{height: `${h*3}px`}}></div>)}
                                </div>
                                <span className="text-[10px] text-stone-500 mt-1 block">Record 30s about yourself (Coming Soon)</span>
                            </div>
                        </div>
                        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex items-center gap-4 hover:border-purple-500/50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Video className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Video Bio</h4>
                                <p className="text-xs text-stone-500">Upload a short introduction video. (Coming Soon)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === TAB 3: KUTUMBA (Family & Collaborators) - NEW === */}
            {activeTab === 'family' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* COLLABORATORS CARD */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-haldi-500" />
                            <h3 className="text-white font-bold">Kutumba (Collaborators)</h3>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-stone-800 flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"><User className="w-4 h-4"/></div>
                                <div>
                                    <h4 className="text-stone-200 text-sm font-bold">Profile Managed By</h4>
                                    <p className="text-xs text-stone-500">Current Setting: {formData.profile_manager}</p>
                                </div>
                            </div>
                            <select 
                                value={formData.profile_manager}
                                onChange={(e) => setFormData({...formData, profile_manager: e.target.value})}
                                className="bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-xs text-white focus:border-haldi-500 outline-none"
                            >
                                <option value="Self">Self</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Relative">Relative</option>
                            </select>
                        </div>
                        <button className="w-full py-3 border border-dashed border-stone-700 rounded-xl text-stone-500 text-sm hover:border-haldi-500 hover:text-haldi-500 transition-colors flex items-center justify-center gap-2">
                            <HeartHandshake className="w-4 h-4" /> Invite Family Member to Manage
                        </button>
                    </div>

                    {/* FAMILY BACKGROUND FORM */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h3 className="md:col-span-2 text-stone-300 font-bold text-sm border-b border-stone-800 pb-2">Family Background</h3>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Father's Occupation</label>
                            <input value={formData.father_occupation} onChange={(e) => setFormData({...formData, father_occupation: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Mother's Occupation</label>
                            <input value={formData.mother_occupation} onChange={(e) => setFormData({...formData, mother_occupation: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Native Place</label>
                            <input value={formData.family_native} onChange={(e) => setFormData({...formData, family_native: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-stone-500 uppercase font-bold">Number of Siblings</label>
                            <input type="number" value={formData.siblings} onChange={(e) => setFormData({...formData, siblings: e.target.value})} className="w-full bg-black border border-stone-700 rounded-lg p-3 text-white focus:border-haldi-500 outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* === TAB 4: PREFERENCES === */}
            {activeTab === 'preferences' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Sliders className="w-5 h-5 text-haldi-500" />
                            <h3 className="text-white font-bold">Who are you looking for?</h3>
                        </div>

                        {/* AGE RANGE */}
                        <div className="mb-8">
                            <label className="text-xs text-stone-500 uppercase font-bold mb-3 block">Age Range</label>
                            <div className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-stone-800 w-fit">
                                <input type="number" value={prefs.age_range[0]} onChange={(e) => setPrefs({...prefs, age_range: [parseInt(e.target.value), prefs.age_range[1]]})} className="w-16 bg-stone-800 border border-stone-600 rounded p-2 text-white text-center focus:border-haldi-500 outline-none" />
                                <span className="text-stone-500 text-sm font-bold">TO</span>
                                <input type="number" value={prefs.age_range[1]} onChange={(e) => setPrefs({...prefs, age_range: [prefs.age_range[0], parseInt(e.target.value)]})} className="w-16 bg-stone-800 border border-stone-600 rounded p-2 text-white text-center focus:border-haldi-500 outline-none" />
                                <span className="text-stone-500 text-sm ml-2">Years Old</span>
                            </div>
                        </div>

                        {/* DIET PREFERENCE */}
                        <div className="mb-8 border-t border-stone-800 pt-6">
                            <label className="text-xs text-stone-500 uppercase font-bold mb-3 block">Dietary Preferences</label>
                            <div className="flex flex-wrap gap-3">
                                {['Vegetarian', 'Non-Veg', 'Vegan', 'Eggetarian'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => togglePref('diet', opt)}
                                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${prefs.diet.includes(opt) ? 'bg-haldi-500 text-black border-haldi-500 font-bold' : 'bg-black text-stone-400 border-stone-700 hover:border-stone-500'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COMMUNITY */}
                        <div className="mb-6 border-t border-stone-800 pt-6">
                            <label className="text-xs text-stone-500 uppercase font-bold mb-3 block">Preferred Communities</label>
                            <div className="flex flex-wrap gap-3">
                                {['Brahmin', 'Kshatriya', 'Patel', 'Reddy', 'Iyer', 'Iyengar', 'Baniya'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => togglePref('community', opt)}
                                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${prefs.community.includes(opt) ? 'bg-stone-200 text-black border-white font-bold' : 'bg-black text-stone-400 border-stone-700 hover:border-stone-500'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-stone-500 mt-2">* These tags influence your AI compatibility score.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}