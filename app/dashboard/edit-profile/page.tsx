"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Save, ArrowLeft, Loader2, CheckCircle, X,
    Sparkles, Briefcase, Users, Heart, Scroll,
    ShieldCheck, Mic, Video, Trash2, Camera, UploadCloud, Upload, Shield, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import AvatarUpload from '@/components/AvatarUpload';

// ── Nakshatra → Raasi auto-fill map ──────────────────────────────────────────
const NAKSHATRA_RAASI: Record<string, string> = {
  'Ashwini': 'Mesha',     'Bharani': 'Mesha',      'Krittika': 'Mesha',
  'Rohini': 'Vrishabha',  'Mrigashira': 'Vrishabha','Ardra': 'Mithuna',
  'Punarvasu': 'Mithuna', 'Pushya': 'Karka',         'Ashlesha': 'Karka',
  'Magha': 'Simha',       'Purva Phalguni': 'Simha', 'Uttara Phalguni': 'Simha',
  'Hasta': 'Kanya',       'Chitra': 'Kanya',         'Swati': 'Tula',
  'Vishakha': 'Tula',     'Anuradha': 'Vrischika',   'Jyeshtha': 'Vrischika',
  'Mula': 'Dhanu',        'Purva Ashadha': 'Dhanu',  'Uttara Ashadha': 'Dhanu',
  'Shravana': 'Makara',   'Dhanishtha': 'Makara',    'Shatabhisha': 'Kumbha',
  'Purva Bhadrapada': 'Kumbha', 'Uttara Bhadrapada': 'Meena', 'Revati': 'Meena',
  // Common aliases
  'Aswini': 'Mesha', 'Karthika': 'Mesha', 'Rohani': 'Vrishabha',
  'Mrigasira': 'Vrishabha', 'Arudra': 'Mithuna', 'Punarpoosam': 'Mithuna',
  'Poosam': 'Karka', 'Ayilyam': 'Karka', 'Makha': 'Simha', 'Pubba': 'Simha',
  'Uthiram': 'Simha', 'Hastham': 'Kanya', 'Chithirai': 'Kanya',
  'Swathi': 'Tula', 'Visakam': 'Tula', 'Anusham': 'Vrischika',
  'Kettai': 'Vrischika', 'Moolam': 'Dhanu', 'Pooradam': 'Dhanu',
  'Uthiradam': 'Dhanu', 'Thiruvonam': 'Makara', 'Avittam': 'Makara',
  'Sadhayam': 'Kumbha', 'Poorattathi': 'Kumbha', 'Uthirattathi': 'Meena', 'Revathi': 'Meena',
};

// ── Height parser ─────────────────────────────────────────────────────────────
function parseHeightInput(raw: string): string {
  const s = raw.trim();
  if (!s) return s;

  // Already formatted: 5'11" or 5'11
  if (/^\d'\d{1,2}"?$/.test(s)) {
    const inches = parseInt(s.split("'")[1]);
    if (inches >= 0 && inches <= 11) return s.endsWith('"') ? s : s + '"';
  }

  // "5 11" or "5-11" → 5'11"
  const spaced = s.match(/^(\d)\s*['\-\s]\s*(\d{1,2})"?$/);
  if (spaced) {
    const [, ft, inch] = spaced;
    if (parseInt(inch) <= 11) return `${ft}'${inch}"`;
  }

  // "511" or "510" → 5'11"
  if (/^\d\d\d$/.test(s)) {
    const ft = s[0];
    const inch = s.slice(1);
    if (parseInt(inch) <= 11) return `${ft}'${inch}"`;
  }

  // cm → ft'in" conversion
  const cm = parseFloat(s.replace(/cm/i, '').trim());
  if (!isNaN(cm) && cm > 100 && cm < 250) {
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = Math.round(totalInches % 12);
    return `${ft}'${inch}"`;
  }

  return s; // return as-is if no pattern matches
}

// ── Location data ─────────────────────────────────────────────────────────────
const USA_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','Washington D.C.'
];

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
  // Union Territories
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'
];

// ── Helper components ─────────────────────────────────────────────────────────

const SectionCard = ({ title, icon, children, className = "" }: any) => (
    <div className={`bg-stone-900/50 border border-stone-800 rounded-2xl p-6 hover:border-stone-700 transition-colors ${className}`}>
        <div className="flex items-center gap-2 mb-6 border-b border-stone-800/50 pb-3">
            <span className="text-haldi-500">{icon}</span>
            <h3 className="font-serif text-lg font-bold text-stone-200">{title}</h3>
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </div>
);

const InputGroup = ({ label, name, value, onChange, placeholder = "", type = "text", options = null, onBlur }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">{label}</label>
        {options ? (
            <select
                name={name}
                value={value || ''}
                onChange={onChange}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition"
            >
                <option value="">Select...</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition placeholder:text-stone-700"
            />
        )}
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function EditProfilePage() {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingID, setUploadingID] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Parent");
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (data) {
                setFormData({
                    ...data,
                    gender: data.gender || '',
                    marital_status: data.marital_status || '',
                    diet: data.diet || '',
                    drinking: data.drinking || '',
                    smoking: data.smoking || '',
                    gothra: data.gothra || '',
                    nakshatra: data.nakshatra || '',
                    rasi: data.rasi || '',
                    nakshatra_padam: data.nakshatra_padam || '',
                    sub_community: data.sub_community || '',
                    brothers: data.brothers || '',
                    sisters: data.sisters || '',
                    father_occupation: data.father_occupation || '',
                    mother_occupation: data.mother_occupation || '',
                    family_native: data.family_native || '',
                    profile_manager: data.profile_manager || 'Self',
                    gallery_images: data.gallery_images || [],
                    voice_intro_url: data.voice_intro_url || '',
                    video_intro_url: data.video_intro_url || '',
                    // Location
                    country: data.country || '',
                    state: data.state || '',
                    // Partner Preferences
                    partner_min_age:        data.partner_min_age        ?? 22,
                    partner_max_age:        data.partner_max_age        ?? 36,
                    partner_diet:           data.partner_diet            || '',
                    partner_marital_status: data.partner_marital_status  || '',
                    partner_location_pref:  data.partner_location_pref   || '',
                    partner_education_min:  data.partner_education_min   || '',
                    partner_notes:          data.partner_notes           || '',
                });
            }
            // Fetch collaborators
            const { data: collabs } = await supabase
                .from('collaborators')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (collabs) setCollaborators(collabs);

            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Nakshatra → Raasi auto-fill
        if (name === 'nakshatra' && value) {
            const autoRaasi = NAKSHATRA_RAASI[value] || NAKSHATRA_RAASI[
                Object.keys(NAKSHATRA_RAASI).find(k => k.toLowerCase() === value.toLowerCase()) || ''
            ];
            if (autoRaasi) {
                setFormData((prev: any) => ({ ...prev, nakshatra: value, rasi: autoRaasi }));
                return;
            }
        }

        // Reset state when country changes
        if (name === 'country') {
            setFormData((prev: any) => ({ ...prev, country: value, state: '' }));
            return;
        }

        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleHeightBlur = () => {
        if (formData.height) {
            const formatted = parseHeightInput(formData.height);
            setFormData((prev: any) => ({ ...prev, height: formatted }));
        }
    };

    // Gallery
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        try {
            setSaving(true);
            const file = e.target.files[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const filePath = `${user.id}/gallery/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
            const newGallery = [...(formData.gallery_images || []), publicUrl];
            setFormData((prev: any) => ({ ...prev, gallery_images: newGallery }));
            const { data: { user: u } } = await supabase.auth.getUser();
            if (u) await supabase.from('profiles').update({ gallery_images: newGallery }).eq('id', u.id);
        } catch (error: any) {
            toast.error("Gallery Upload Failed", { description: error.message });
        } finally {
            setSaving(false);
        }
    };

    const removeGalleryImage = async (index: number) => {
        const newGallery = formData.gallery_images.filter((_: any, idx: number) => idx !== index);
        setFormData((prev: any) => ({ ...prev, gallery_images: newGallery }));
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ gallery_images: newGallery }).eq('id', user.id);
    };

    // Audio upload
    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploadingAudio(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const ext = file.name.split('.').pop();
            const filePath = `${user.id}/voice_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('voice_intros').upload(filePath, file, { contentType: file.type });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('voice_intros').getPublicUrl(filePath);
            setFormData((prev: any) => ({ ...prev, voice_intro_url: publicUrl }));
            toast.success("Voice intro uploaded!");
        } catch (error: any) {
            toast.error("Audio Upload Failed", { description: error.message });
        } finally {
            setUploadingAudio(false);
        }
    };

    // Varaahi
    const handleVaraahiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploadingID(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/govt_id_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('varaahi_docs').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { error: dbError } = await supabase.from('profiles').update({
                varaahi_status: 'pending_verification', govt_id_url: fileName
            }).eq('id', user.id);
            if (dbError) throw dbError;
            setSuccessMessage("ID Uploaded! Verification pending.");
            setTimeout(() => setSuccessMessage(''), 3000);
            setFormData((prev: any) => ({ ...prev, varaahi_status: 'pending_verification' }));
        } catch (error: any) {
            toast.error("ID Upload Failed", { description: error.message });
        } finally {
            setUploadingID(false);
        }
    };

    const handleSendInvite = async () => {
        if (!inviteEmail.includes('@')) {
            toast.error("Invalid Email", { description: "Please enter a valid email address." });
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('collaborators').insert({
                user_id: user.id, collaborator_email: inviteEmail, role: inviteRole, status: 'pending'
            });
            if (error) throw error;
            toast.success(`Invite sent to ${inviteEmail}!`);
            setCollaborators(prev => [{ collaborator_email: inviteEmail, role: inviteRole, status: 'pending', id: crypto.randomUUID() }, ...prev]);
            setIsInviting(false);
            setInviteEmail("");
        } catch (error: any) {
            toast.error("Invite Failed", { description: error.message });
        }
    };

    const handleRemoveCollaborator = async (collabId: string) => {
        setCollaborators(prev => prev.filter(c => c.id !== collabId));
        const { error } = await supabase.from('collaborators').delete().eq('id', collabId);
        if (error) toast.error("Could not remove collaborator");
        else toast.success("Collaborator removed");
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from('profiles')
            .update({ ...formData, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        setSaving(false);
        if (error) {
            toast.error("Update Failed", { description: error.message });
        } else {
            toast.success("Profile Updated", { description: "Your changes have been saved." });
        }
    };

    const stateOptions = formData.country === 'USA' ? USA_STATES : formData.country === 'India' ? INDIA_STATES : [];

    if (loading) return (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-haldi-500">
            <Loader2 className="animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-950 pb-24 font-sans text-stone-200">

            {/* ── HEADER ───────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur border-b border-stone-800">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    {/* Left: logo + back */}
                    <div className="flex items-center gap-4">
                        <Link href="/" aria-label="Pravara Home">
                            <Image
                                src="/logo3.png"
                                alt="Pravara"
                                width={100}
                                height={34}
                                className="object-contain [mix-blend-mode:lighten]"
                                priority
                            />
                        </Link>
                        <span className="text-stone-700 hidden sm:inline">|</span>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-1.5 text-stone-400 hover:text-haldi-400 transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                    </div>

                    {/* Center: page title */}
                    <div className="hidden md:block text-center">
                        <h1 className="text-base font-serif font-bold text-white leading-none">Edit Profile</h1>
                        <p className="text-[10px] text-stone-500 mt-0.5">Changes saved on media upload · Save button for text</p>
                    </div>

                    {/* Right: save button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-haldi-500 hover:bg-haldi-600 text-stone-950 font-bold rounded-full transition shadow-lg shadow-orange-500/20 disabled:opacity-50 text-sm"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* TOAST */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-20 right-6 bg-green-900/90 border border-green-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 z-50 font-medium backdrop-blur"
                >
                    <CheckCircle size={18} className="text-green-400" /> {successMessage}
                </motion.div>
            )}

            <main className="max-w-7xl mx-auto mt-8 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                    {/* ── LEFT COLUMN ──────────────────────────────────── */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* PHOTO */}
                        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-haldi-500/50 transition">
                            <AvatarUpload
                                currentUrl={formData.image_url}
                                size={120}
                                onUploadComplete={(url) => {
                                    setFormData((prev: any) => ({ ...prev, image_url: url }));
                                    toast.success("Photo updated!");
                                }}
                            />
                            <h3 className="text-stone-300 font-bold text-sm mt-4">Profile Photo</h3>
                            <p className="text-xs text-stone-500 mt-1">Tap to change · JPG or PNG</p>
                        </div>

                        {/* VARAAHI SHIELD */}
                        <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-500 group ${
                            formData.varaahi_status === 'verified'
                                ? 'bg-gradient-to-br from-green-950/40 to-stone-950 border-green-500/30'
                                : 'bg-stone-900/50 border-stone-800 hover:border-haldi-500/30'
                        }`}>
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-35 transition-all duration-500 flex items-center justify-center">
                                <img src="/varaahi-shield.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.varaahi_status === 'verified' ? 'bg-green-500/20 text-green-500' : 'bg-stone-800 text-stone-400'}`}>
                                        <Shield size={16} />
                                    </div>
                                    <div>
                                        <span className="font-serif font-bold text-stone-200 block leading-tight">Varaahi Shield</span>
                                        <span className="text-[10px] text-stone-500 uppercase tracking-widest">Identity Verification</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                                    formData.varaahi_status === 'verified' ? 'bg-green-950 text-green-400 border-green-800' :
                                    formData.varaahi_status === 'pending_verification' ? 'bg-yellow-950 text-yellow-500 border-yellow-800' :
                                    'bg-stone-950 text-stone-500 border-stone-800'
                                }`}>
                                    {formData.varaahi_status === 'verified' ? 'VERIFIED' :
                                     formData.varaahi_status === 'pending_verification' ? 'PENDING' : 'UNVERIFIED'}
                                </span>
                            </div>
                            <p className="relative z-10 text-xs text-stone-500 mb-4 leading-relaxed max-w-[90%]">
                                Upload Government ID to activate the <strong className="text-haldi-500">Varaahi Shield</strong> and get the Verified Badge.
                            </p>
                            <div className="relative z-10">
                                <button className={`w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                                     formData.varaahi_status === 'verified'
                                     ? 'bg-green-900/20 border-green-800 text-green-500 cursor-default'
                                     : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-haldi-500 hover:text-haldi-500'
                                }`}>
                                    {uploadingID ? <Loader2 className="animate-spin" size={14} /> :
                                     formData.varaahi_status === 'verified' ? <CheckCircle size={14} /> : <Upload size={14} />}
                                    {uploadingID ? "Uploading Securely…" :
                                     formData.varaahi_status === 'verified' ? "Identity Verified" :
                                     formData.varaahi_status === 'pending_verification' ? "Verification In Progress" : "Upload ID Document"}
                                </button>
                                {formData.varaahi_status !== 'verified' && (
                                    <input type="file" accept="image/*,.pdf" onChange={handleVaraahiUpload} disabled={uploadingID} className="absolute inset-0 opacity-0 cursor-pointer" />
                                )}
                            </div>
                        </div>

                        {/* IDENTITY & BIO */}
                        <SectionCard title="Identity & Bio" icon={<Sparkles size={20} />}>
                            <InputGroup label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Your full name" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female']} />
                                <InputGroup
                                    label={`Height (e.g. 5'11")`}
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    onBlur={handleHeightBlur}
                                    placeholder={`5'10" or 178cm`}
                                />
                            </div>
                            <InputGroup label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={['Never Married', 'Divorced', 'Widowed', 'Separated']} />

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">About Me</label>
                                <textarea
                                    name="bio" rows={5} placeholder="Write a short bio…"
                                    value={formData.bio || ''} onChange={handleChange}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition placeholder:text-stone-700 resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Diet" name="diet" value={formData.diet} onChange={handleChange} options={['Veg', 'Non-Veg', 'Vegan', 'Eggetarian']} />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Drink / Smoke</label>
                                    <div className="flex gap-2">
                                        <select name="drinking" value={formData.drinking || ''} onChange={handleChange} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:border-haldi-500 outline-none">
                                            <option value="">Drink?</option><option>No</option><option>Socially</option><option>Yes</option>
                                        </select>
                                        <select name="smoking" value={formData.smoking || ''} onChange={handleChange} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:border-haldi-500 outline-none">
                                            <option value="">Smoke?</option><option>No</option><option>Socially</option><option>Yes</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* PARTNER PREFERENCES */}
                        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 hover:border-haldi-500/30 transition">
                            <div className="flex items-center gap-2 mb-5">
                                <Heart className="text-pink-500" size={20} />
                                <h3 className="font-serif text-lg font-bold text-stone-200">Partner Preferences</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Age Range */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">Age Range</label>
                                    <div className="flex items-center gap-3">
                                        <input type="number" name="partner_min_age" min={18} max={60}
                                            value={formData.partner_min_age || 22} onChange={handleChange}
                                            aria-label="Min partner age"
                                            className="w-16 bg-stone-950 border border-stone-800 rounded-lg p-2 text-center text-sm outline-none focus:border-haldi-500 text-stone-200"
                                        />
                                        <span className="text-stone-600 text-xs">to</span>
                                        <input type="number" name="partner_max_age" min={18} max={70}
                                            value={formData.partner_max_age || 36} onChange={handleChange}
                                            aria-label="Max partner age"
                                            className="w-16 bg-stone-950 border border-stone-800 rounded-lg p-2 text-center text-sm outline-none focus:border-haldi-500 text-stone-200"
                                        />
                                        <span className="text-[10px] text-stone-600">yrs</span>
                                    </div>
                                </div>

                                <InputGroup label="Diet Preference" name="partner_diet" value={formData.partner_diet} onChange={handleChange}
                                    options={['Vegetarian','Eggetarian','Non-Vegetarian','Vegan','No Preference']} />
                                <InputGroup label="Marital Status" name="partner_marital_status" value={formData.partner_marital_status} onChange={handleChange}
                                    options={['Never Married','Divorced','Widowed','No Preference']} />
                                <InputGroup label="Minimum Education" name="partner_education_min" value={formData.partner_education_min} onChange={handleChange}
                                    options={["Any","Bachelor's","Master's / MBA","PhD","Professional (CA/MBBS/etc)"]} />
                                <InputGroup label="Preferred Location / City" name="partner_location_pref" value={formData.partner_location_pref} onChange={handleChange}
                                    placeholder="e.g. Hyderabad, USA, Open to anywhere" />

                                {/* Free-form notes */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Additional Preferences (free text)</label>
                                    <textarea
                                        name="partner_notes" rows={3}
                                        placeholder="e.g. Preferably from a traditional family, open to relocation, values spirituality…"
                                        value={formData.partner_notes || ''} onChange={handleChange}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition placeholder:text-stone-700 resize-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ─────────────────────────────────── */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">

                        {/* VEDIC ROOTS */}
                        <div className="md:col-span-2">
                            <SectionCard
                                title="Vedic Roots — The Matching Engine"
                                icon={<Scroll size={20} />}
                                className="bg-[#1a1710] border-haldi-900/50 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none"><Sparkles size={100} /></div>
                                <p className="text-xs text-haldi-600/80 -mt-2 mb-4 bg-haldi-900/10 p-2 rounded border border-haldi-500/10">
                                    ⚠️ <strong>Crucial:</strong> Accurate Nakshatra &amp; Gothra unlock the full Ashtakoot compatibility score.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                                    <InputGroup label="Time of Birth" name="birth_time" type="time" value={formData.birth_time} onChange={handleChange} />
                                    <InputGroup label="Place of Birth" name="birth_place" value={formData.birth_place} onChange={handleChange} placeholder="City, State" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <InputGroup label="Gothra" name="gothra" value={formData.gothra} onChange={handleChange} placeholder="e.g. Kashyap" />
                                    <InputGroup label="Sub Community" name="sub_community" value={formData.sub_community} onChange={handleChange} placeholder="e.g. Iyer / Smartha" />
                                    <InputGroup label="Pravara (Optional)" name="pravara" value={formData.pravara} onChange={handleChange} placeholder="e.g. Trayarshreya" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <InputGroup label="Nakshatra" name="nakshatra" value={formData.nakshatra} onChange={handleChange} placeholder="e.g. Rohini" />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                                            Raasi (Moon Sign)
                                            {formData.rasi && formData.nakshatra && NAKSHATRA_RAASI[formData.nakshatra] && (
                                                <span className="ml-2 text-haldi-500 normal-case font-normal text-[10px]">· auto-filled</span>
                                            )}
                                        </label>
                                        <input
                                            name="rasi" value={formData.rasi || ''} onChange={handleChange}
                                            placeholder="Auto-fills from Nakshatra"
                                            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition placeholder:text-stone-700"
                                        />
                                    </div>
                                    <InputGroup label="Padam" name="nakshatra_padam" value={formData.nakshatra_padam} onChange={handleChange} options={['1', '2', '3', '4']} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* CAREER & LOCATION */}
                        <SectionCard title="Career & Location" icon={<Briefcase size={20} />}>
                            <InputGroup label="Profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Software Engineer" />
                            <InputGroup label="Education" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. MS in Computer Science" />

                            {/* Country + State */}
                            <InputGroup label="Country" name="country" value={formData.country} onChange={handleChange} options={['India', 'USA']} />
                            {stateOptions.length > 0 && (
                                <InputGroup label="State / Province" name="state" value={formData.state} onChange={handleChange} options={stateOptions} />
                            )}

                            <InputGroup label="Current City / Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore or San Jose" />
                            <InputGroup label="Visa / Residency Status" name="visa_status" value={formData.visa_status} onChange={handleChange} placeholder="e.g. H1B / Citizen / OCI" />
                        </SectionCard>

                        {/* FAMILY & KUTUMBA */}
                        <SectionCard title="Family & Kutumba" icon={<Users size={20} />}>

                            {/* Profile management / invite */}
                            <div className="bg-stone-950/50 border border-stone-800 rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] uppercase font-bold text-haldi-500 tracking-wider">Profile Management Team</label>
                                    <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">1 Active</span>
                                </div>

                                <div className="flex items-center justify-between bg-stone-900 p-2 rounded-lg mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-haldi-500/20 text-haldi-500 flex items-center justify-center text-xs font-bold">
                                            {formData.full_name ? formData.full_name[0] : 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs text-white font-bold">You (Owner)</p>
                                            <p className="text-[10px] text-stone-500">Full Access</p>
                                        </div>
                                    </div>
                                    <select name="profile_manager" value={formData.profile_manager || 'Self'} onChange={handleChange} className="bg-black border border-stone-700 rounded px-2 py-1 text-[10px] text-stone-300 outline-none focus:border-haldi-500">
                                        <option value="Self">Show as Self</option>
                                        <option value="Parent">Show as Parent</option>
                                        <option value="Sibling">Show as Sibling</option>
                                    </select>
                                </div>

                                <div className="mt-3">
                                    {isInviting ? (
                                        <div className="bg-stone-900 border border-haldi-500/50 rounded-lg p-3">
                                            <p className="text-[10px] uppercase font-bold text-haldi-500 mb-2">Invite Family Member</p>
                                            <div className="flex gap-2 mb-2">
                                                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                                                    placeholder="Family member's email…"
                                                    className="flex-1 bg-black border border-stone-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-haldi-500"
                                                />
                                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="bg-black border border-stone-700 rounded px-2 py-1 text-xs text-stone-300 outline-none">
                                                    <option value="Parent">Parent</option>
                                                    <option value="Sibling">Sibling</option>
                                                    <option value="Relative">Relative</option>
                                                    <option value="Friend">Friend</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handleSendInvite} className="flex-1 bg-haldi-500 hover:bg-haldi-600 text-black text-xs font-bold py-1.5 rounded transition">
                                                    Send Invite
                                                </button>
                                                <button type="button" onClick={() => setIsInviting(false)} className="px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-bold py-1.5 rounded transition">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setIsInviting(true)}
                                            className="w-full py-2 border border-dashed border-stone-700 rounded-lg text-stone-500 text-xs hover:border-haldi-500 hover:text-haldi-500 transition flex items-center justify-center gap-2"
                                        >
                                            <Users size={13} /> Invite Family Member as Collaborator
                                        </button>
                                    )}
                                </div>

                                {/* Collaborator List */}
                                {collaborators.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Active Collaborators</label>
                                        {collaborators.map((c) => (
                                            <div key={c.id} className="flex items-center justify-between bg-stone-900 p-2 rounded-lg">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-6 h-6 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {c.collaborator_email?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-white font-medium truncate">{c.collaborator_email}</p>
                                                        <p className="text-[10px] text-stone-500">{c.role} · <span className={c.status === 'accepted' ? 'text-green-500' : 'text-yellow-500'}>{c.status}</span></p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveCollaborator(c.id)} className="text-stone-600 hover:text-red-400 transition-colors p-1 flex-shrink-0" title="Remove">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <InputGroup label="Father's Occupation" name="father_occupation" value={formData.father_occupation} onChange={handleChange} placeholder="e.g. Retired Banker" />
                            <InputGroup label="Mother's Occupation" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} placeholder="e.g. Home Maker" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Brothers" name="brothers" value={formData.brothers} onChange={handleChange} placeholder="e.g. 1 Elder" />
                                <InputGroup label="Sisters" name="sisters" value={formData.sisters} onChange={handleChange} placeholder="e.g. None" />
                            </div>
                            <InputGroup label="Ancestral Native" name="family_native" value={formData.family_native} onChange={handleChange} placeholder="e.g. Udupi, Karnataka" />
                        </SectionCard>

                        {/* MEDIA GALLERY */}
                        <div className="md:col-span-2">
                            <SectionCard title="Life & Moments Gallery" icon={<Camera size={20} />}>

                                {/* Photo Grid */}
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6">
                                    {(formData.gallery_images || []).map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-square relative group rounded-lg overflow-hidden border border-stone-800">
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                            <button onClick={() => removeGalleryImage(idx)}
                                                className="absolute top-1 right-1 bg-red-600/90 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {(formData.gallery_images?.length || 0) < 5 && (
                                        <label className="aspect-square border-2 border-dashed border-stone-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-haldi-500 hover:bg-stone-900 transition text-stone-500 hover:text-haldi-500">
                                            <UploadCloud size={20} />
                                            <span className="text-[10px] font-bold mt-1">Add Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} disabled={saving} />
                                        </label>
                                    )}
                                </div>

                                {/* MEDIA STUDIO */}
                                <div className="border-t border-stone-800 pt-6 mt-2">
                                    <h4 className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Video size={14} /> Media Studio
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* Voice Intro — URL + file upload */}
                                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-stone-400">
                                                <Mic size={16} /> <span className="text-xs font-bold uppercase">Voice Intro</span>
                                            </div>

                                            {/* Audio player if URL set */}
                                            {formData.voice_intro_url && (
                                                <audio controls src={formData.voice_intro_url} className="w-full h-8 accent-haldi-500" />
                                            )}

                                            <input
                                                name="voice_intro_url" value={formData.voice_intro_url || ''} onChange={handleChange}
                                                placeholder="Paste audio URL (Vocaroo, Drive…)"
                                                className="bg-transparent border-b border-stone-800 focus:border-haldi-500 outline-none text-sm py-1 text-stone-300 placeholder:text-stone-600"
                                            />

                                            {/* Upload audio file */}
                                            <label className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-haldi-400 cursor-pointer transition w-fit">
                                                {uploadingAudio
                                                    ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                                                    : <><UploadCloud size={13} /> Upload Audio File (MP3/M4A/OGG)</>
                                                }
                                                <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} disabled={uploadingAudio} />
                                            </label>
                                        </div>

                                        {/* Video Bio — URL only */}
                                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-stone-400">
                                                <Video size={16} /> <span className="text-xs font-bold uppercase">Video Bio</span>
                                            </div>
                                            <input
                                                name="video_intro_url" value={formData.video_intro_url || ''} onChange={handleChange}
                                                placeholder="YouTube Unlisted / Loom link…"
                                                className="bg-transparent border-b border-stone-800 focus:border-haldi-500 outline-none text-sm py-1 text-stone-300 placeholder:text-stone-600"
                                            />
                                            <p className="text-[10px] text-stone-600">
                                                Paste a YouTube Unlisted, Loom, or Vimeo link. Direct video upload is not supported to protect storage.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                </div>

                {/* ── NARADA BANNER ─────────────────────────────────────── */}
                <div className="mt-10 mb-4">
                    <div className="relative overflow-hidden rounded-2xl border border-haldi-500/20 bg-gradient-to-r from-stone-900 via-haldi-900/10 to-stone-900 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-haldi-500/5 to-transparent" />
                        </div>
                        <div className="relative flex-shrink-0 w-14 h-14 rounded-full bg-haldi-500/10 border border-haldi-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.12)]">
                            <span className="text-haldi-400 font-serif select-none" style={{ fontSize: "28px", lineHeight: 1 }}>ॐ</span>
                        </div>
                        <div className="relative flex-1 min-w-0">
                            <p className="text-xs font-bold text-haldi-500 uppercase tracking-widest mb-0.5">Narada · Divine Profile Guide</p>
                            <h3 className="text-stone-100 font-serif font-semibold text-lg leading-snug">
                                Let Narada fill your profile through conversation
                            </h3>
                            <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                                Tell Narada your story — the AI extracts and fills your Vedic roots, career, and preferences automatically.<br />
                                <span className="text-stone-600 text-[10px]">Narada fills your profile. Sutradhar (bottom right) guides your search.</span>
                            </p>
                        </div>
                        <a href="/onboarding"
                            className="relative flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-haldi-900/20 active:scale-95 whitespace-nowrap"
                        >
                            <Sparkles size={15} /> Talk to Narada
                        </a>
                    </div>
                </div>

            </main>
        </div>
    );
}
