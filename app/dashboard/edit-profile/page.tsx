"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    Save, ArrowLeft, Loader2, CheckCircle, 
    Sparkles, Briefcase, Users, Heart, Scroll, 
    ShieldCheck, Mic, Video, Trash2, Camera, UploadCloud, Upload, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import AvatarUpload from '@/components/AvatarUpload'; // Ensure this matches your file path

// --- HELPER COMPONENTS (Moved OUTSIDE to fix focus bug) ---

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

const InputGroup = ({ label, name, value, onChange, placeholder = "", type = "text", options = null }: any) => (
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
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition placeholder:text-stone-700" 
            />
        )}
    </div>
);

// --- MAIN COMPONENT ---

export default function EditProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingID, setUploadingID] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Parent");
    const [formData, setFormData] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState('');

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (data) {
                setFormData({
                    ...data,
                    // Identity Defaults
                    gender: data.gender || '',
                    marital_status: data.marital_status || '',
                    diet: data.diet || '',
                    drinking: data.drinking || '',
                    smoking: data.smoking || '',
                    
                    // Vedic Defaults
                    gothra: data.gothra || '',
                    nakshatra: data.nakshatra || '',
                    rasi: data.rasi || '', 
                    nakshatra_padam: data.nakshatra_padam || '', 
                    sub_community: data.sub_community || '', 

                    // Family & Kutumba Defaults
                    brothers: data.brothers || '',
                    sisters: data.sisters || '',
                    father_occupation: data.father_occupation || '',
                    mother_occupation: data.mother_occupation || '',
                    family_native: data.family_native || '',
                    profile_manager: data.profile_manager || 'Self',

                    // Media Defaults
                    gallery_images: data.gallery_images || [],
                    voice_intro_url: data.voice_intro_url || '',
                    video_intro_url: data.video_intro_url || '',
                    
                    // Partner Preferences Defaults
                    partner_preferences: data.partner_preferences || {
                        age_min: 21,
                        age_max: 35,
                        height_min: "5'0\"",
                        communities: []
                    }
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    // --- HANDLERS ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // Gallery Logic
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
            
            // Update Local State & DB
            const newGallery = [...(formData.gallery_images || []), publicUrl];
            setFormData((prev: any) => ({ ...prev, gallery_images: newGallery }));
            
            // Save immediately to avoid data loss
            await supabase.from('profiles').update({ gallery_images: newGallery }).eq('id', user.id);

        } catch (error: any) {
            alert("Upload failed: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const removeGalleryImage = async (index: number) => {
        const newGallery = formData.gallery_images.filter((_: any, idx: number) => idx !== index);
        setFormData((prev: any) => ({ ...prev, gallery_images: newGallery }));
        
        // Optimistic update
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
             await supabase.from('profiles').update({ gallery_images: newGallery }).eq('id', user.id);
        }
    };

    const handleVaraahiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploadingID(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/govt_id_${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('varaahi_docs')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Save the PATH to the profile (not the full URL, to keep it private)
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ 
                    varaahi_status: 'pending_verification',
                    govt_id_url: fileName 
                })
                .eq('id', user.id);

            if (dbError) throw dbError;

            setSuccessMessage("ID Uploaded! Verification pending.");
            setTimeout(() => setSuccessMessage(''), 3000);
            
            // Refresh local data
            setFormData((prev: any) => ({ ...prev, varaahi_status: 'pending_verification' }));

        } catch (error: any) {
            console.error('Error uploading ID:', error.message);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploadingID(false);
        }
    };

    const handleSendInvite = async () => {
        if (!inviteEmail.includes('@')) return alert("Please enter a valid email.");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('collaborators')
                .insert({
                    profile_id: user.id,
                    email: inviteEmail,
                    role: inviteRole,
                    status: 'pending'
                });

            if (error) throw error;

            setSuccessMessage(`Invite sent to ${inviteEmail}!`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setIsInviting(false);
            setInviteEmail("");

        } catch (error: any) {
            alert("Error sending invite: " + error.message);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ ...formData, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        setSaving(false);
        
        if (error) {
            alert("Error saving: " + error.message);
        } else {
            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-haldi-500"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-stone-950 pb-24 font-sans text-stone-200">
            
            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur border-b border-stone-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-stone-800 rounded-full text-stone-400 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-white leading-none">Edit Profile</h1>
                        <p className="text-xs text-stone-500 mt-1">Updates are saved automatically on media upload.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-haldi-500 hover:bg-haldi-600 text-stone-950 font-bold rounded-full transition shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            {/* TOAST */}
            {successMessage && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-24 right-6 bg-green-900/90 border border-green-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 z-50 font-medium backdrop-blur"
                >
                    <CheckCircle size={20} className="text-green-400" /> {successMessage}
                </motion.div>
            )}

            <main className="max-w-7xl mx-auto mt-8 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    
                    {/* --- LEFT COLUMN: Identity, Varaahi, Photo --- */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. PHOTO UPLOAD CARD */}
                        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-haldi-500/50 transition">
                            <AvatarUpload 
                                currentUrl={formData.image_url} 
                                size={120}
                                onUploadComplete={(url) => {
                                    setFormData((prev: any) => ({ ...prev, image_url: url }));
                                    setSuccessMessage("Photo uploaded!");
                                    setTimeout(() => setSuccessMessage(''), 3000);
                                }}
                            />
                            <h3 className="text-stone-300 font-bold text-sm mt-4">Profile Photo</h3>
                            <p className="text-xs text-stone-500 mt-1">Tap to change</p>
                        </div>

                        {/* 2. VARAAHI SHIELD CARD (Branded) */}
                        <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-500 group ${
                            formData.varaahi_status === 'verified' 
                                ? 'bg-gradient-to-br from-green-950/40 to-stone-950 border-green-500/30' 
                                : 'bg-stone-900/50 border-stone-800 hover:border-haldi-500/30'
                        }`}>
                            
                            {/* 🌟 THE BRANDING WATERMARK */}
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-35 transition-all duration-500 flex items-center justify-center">
                                <img 
                                    src="/varaahi-shield.png" 
                                    alt="Varaahi Shield" 
                                    className="w-full h-full object-cover"
                                /> 
                            </div>

                            {/* Header Section */}
                            <div className="relative z-10 flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        formData.varaahi_status === 'verified' ? 'bg-green-500/20 text-green-500' : 'bg-stone-800 text-stone-400'
                                    }`}>
                                        <Shield size={16} />
                                    </div>
                                    <div>
                                        <span className="font-serif font-bold text-stone-200 block leading-tight">Varaahi Shield</span>
                                        <span className="text-[10px] text-stone-500 uppercase tracking-widest">Verification</span>
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
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

                            {/* The Upload Button */}
                            <div className="relative z-10">
                                <button className={`w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                                     formData.varaahi_status === 'verified' 
                                     ? 'bg-green-900/20 border-green-800 text-green-500 cursor-default'
                                     : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-haldi-500 hover:text-haldi-500'
                                }`}>
                                    {uploadingID ? <Loader2 className="animate-spin" size={14} /> : 
                                     formData.varaahi_status === 'verified' ? <CheckCircle size={14} /> : <Upload size={14} />}
                                    
                                    {uploadingID ? "Uploading Securely..." : 
                                     formData.varaahi_status === 'verified' ? "Identity Verified" : 
                                     formData.varaahi_status === 'pending_verification' ? "Verification In Progress" : "Upload ID Document"}
                                </button>
                                
                                {/* Hidden Input (Only active if not verified) */}
                                {formData.varaahi_status !== 'verified' && (
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={handleVaraahiUpload}
                                        disabled={uploadingID}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>

                        {/* 3. IDENTITY FORM */}
                        <SectionCard title="Identity & Bio" icon={<Sparkles size={20} />}>
                            <InputGroup 
                                label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" 
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female']} />
                                <InputGroup label="Height" name="height" value={formData.height} onChange={handleChange} placeholder="5'10&quot;" />
                            </div>
                            <InputGroup label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={['Never Married', 'Divorced', 'Widowed', 'Separated']} />

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">About Me</label>
                                <textarea 
                                    name="bio" 
                                    rows={5} 
                                    placeholder="Write a short bio..." 
                                    value={formData.bio || ''} 
                                    onChange={handleChange} 
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:border-haldi-500 outline-none transition placeholder:text-stone-700 resize-none leading-relaxed" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Diet" name="diet" value={formData.diet} onChange={handleChange} options={['Veg', 'Non-Veg', 'Vegan', 'Eggetarian']} />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Drink / Smoke</label>
                                    <div className="flex gap-2">
                                        <select name="drinking" value={formData.drinking || ''} onChange={handleChange} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:border-haldi-500 outline-none"><option value="">Drink?</option><option value="No">No</option><option value="Socially">Socially</option><option value="Yes">Yes</option></select>
                                        <select name="smoking" value={formData.smoking || ''} onChange={handleChange} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:border-haldi-500 outline-none"><option value="">Smoke?</option><option value="No">No</option><option value="Socially">Socially</option><option value="Yes">Yes</option></select>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 4. PARTNER PREFERENCES (Real Form) */}
                        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 hover:border-haldi-500/30 transition">
                            <div className="flex items-center gap-2 mb-4">
                                <Heart className="text-pink-500" size={20} />
                                <h3 className="font-serif text-lg font-bold text-stone-200">Partner Preferences</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Age Range */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">Age Range</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={formData.partner_preferences?.age_min || 21}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                partner_preferences: { ...formData.partner_preferences, age_min: parseInt(e.target.value) }
                                            })}
                                            className="w-16 bg-stone-950 border border-stone-800 rounded-lg p-2 text-center text-sm outline-none focus:border-pink-500 text-stone-200"
                                        />
                                        <span className="text-stone-600 text-xs">to</span>
                                        <input 
                                            type="number" 
                                            value={formData.partner_preferences?.age_max || 35}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                partner_preferences: { ...formData.partner_preferences, age_max: parseInt(e.target.value) }
                                            })}
                                            className="w-16 bg-stone-950 border border-stone-800 rounded-lg p-2 text-center text-sm outline-none focus:border-pink-500 text-stone-200"
                                        />
                                    </div>
                                </div>

                                {/* Preferred Communities */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">Communities</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Iyer', 'Iyengar', 'Smartha', 'Madhva', 'Kanyakubja', 'Maithil'].map(comm => (
                                            <button
                                                key={comm}
                                                type="button"
                                                onClick={() => {
                                                    const current = formData.partner_preferences?.communities || [];
                                                    const updated = current.includes(comm) 
                                                        ? current.filter((c: string) => c !== comm)
                                                        : [...current, comm];
                                                    setFormData({
                                                        ...formData, 
                                                        partner_preferences: { ...formData.partner_preferences, communities: updated }
                                                    });
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs border transition ${
                                                    formData.partner_preferences?.communities?.includes(comm)
                                                    ? 'bg-pink-900/20 border-pink-500 text-pink-400'
                                                    : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'
                                                }`}
                                            >
                                                {comm}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: Vedic, Family, Media --- */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                        
                        {/* 4. VEDIC ROOTS (Top Priority) */}
                        <div className="md:col-span-2">
                            <SectionCard 
                                title="Vedic Roots (The Engine)" 
                                icon={<Scroll size={20} />} 
                                className="bg-[#1a1710] border-haldi-900/50 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none"><Sparkles size={100} /></div>
                                <p className="text-xs text-haldi-600/80 -mt-2 mb-4 bg-haldi-900/10 p-2 rounded border border-haldi-500/10">
                                    ⚠️ <strong>Crucial:</strong> Ensure birth time and Nakshatra are accurate for correct Bhrugu compatibility scores.
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
                                    <InputGroup label="Raasi (Moon Sign)" name="rasi" value={formData.rasi} onChange={handleChange} placeholder="e.g. Vrishabha" />
                                    <InputGroup label="Padam" name="nakshatra_padam" value={formData.nakshatra_padam} onChange={handleChange} options={['1', '2', '3', '4']} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* 5. CAREER */}
                        <SectionCard title="Career & Location" icon={<Briefcase size={20} />}>
                            <InputGroup label="Profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Software Engineer" />
                            <InputGroup label="Education" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. MS in CS" />
                            <InputGroup label="Current Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore, India" />
                            <InputGroup label="Visa Status" name="visa_status" value={formData.visa_status} onChange={handleChange} placeholder="e.g. H1B / Citizen" />
                        </SectionCard>

                        {/* 6. FAMILY & KUTUMBA */}
                        <SectionCard title="Family & Kutumba" icon={<Users size={20} />}>
                            
                            {/* KUTUMBA: Profile Management Team */}
                            <div className="bg-stone-950/50 border border-stone-800 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] uppercase font-bold text-haldi-500 tracking-wider">Profile Management Team</label>
                                    <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">1 Active</span>
                                </div>
                                
                                {/* Current Manager (You) */}
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
                                    <select 
                                        name="profile_manager" 
                                        value={formData.profile_manager || 'Self'} 
                                        onChange={handleChange} 
                                        className="bg-black border border-stone-700 rounded px-2 py-1 text-[10px] text-stone-300 outline-none focus:border-haldi-500"
                                    >
                                        <option value="Self">Show as Self</option>
                                        <option value="Parent">Show as Parent</option>
                                        <option value="Sibling">Show as Sibling</option>
                                    </select>
                                </div>

                                {/* KUTUMBA INVITE SECTION */}
                                <div className="mt-3">
                                    {isInviting ? (
                                        <div className="bg-stone-900 border border-haldi-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[10px] uppercase font-bold text-haldi-500 mb-2">Invite Family Member</p>
                                            
                                            <div className="flex gap-2 mb-2">
                                                <input 
                                                    type="email" 
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    placeholder="Enter family email..."
                                                    className="flex-1 bg-black border border-stone-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-haldi-500"
                                                />
                                                <select 
                                                    value={inviteRole}
                                                    onChange={(e) => setInviteRole(e.target.value)}
                                                    className="bg-black border border-stone-700 rounded px-2 py-1 text-xs text-stone-300 outline-none"
                                                >
                                                    <option value="Parent">Parent</option>
                                                    <option value="Sibling">Sibling</option>
                                                    <option value="Relative">Relative</option>
                                                </select>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={handleSendInvite}
                                                    className="flex-1 bg-haldi-500 hover:bg-haldi-600 text-black text-xs font-bold py-1 rounded transition"
                                                >
                                                    Send Invite
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsInviting(false)}
                                                    className="px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-bold py-1 rounded transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={() => setIsInviting(true)}
                                            className="w-full py-2 border border-dashed border-stone-700 rounded-lg text-stone-500 text-xs hover:border-haldi-500 hover:text-haldi-500 transition flex items-center justify-center gap-2"
                                        >
                                            <Users size={14} /> Invite Family Member (Collaborator)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* FAMILY DETAILS FORM */}
                            <InputGroup label="Father's Occupation" name="father_occupation" value={formData.father_occupation} onChange={handleChange} placeholder="e.g. Retired Banker" />
                            <InputGroup label="Mother's Occupation" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} placeholder="e.g. Home Maker" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Brothers" name="brothers" value={formData.brothers} onChange={handleChange} placeholder="e.g. 1 Elder" />
                                <InputGroup label="Sisters" name="sisters" value={formData.sisters} onChange={handleChange} placeholder="e.g. None" />
                            </div>
                            <InputGroup label="Ancestral Native" name="family_native" value={formData.family_native} onChange={handleChange} placeholder="e.g. Udupi, Karnataka" />
                        </SectionCard>

                        {/* 7. MEDIA GALLERY (Audio/Video/Photos) - Full Width */}
                        <div className="md:col-span-2">
                            <SectionCard title="Life & Moments Gallery" icon={<Camera size={20} />}>
                                
                                {/* Photo Grid */}
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6">
                                    {(formData.gallery_images || []).map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-square relative group rounded-lg overflow-hidden border border-stone-800">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => removeGalleryImage(idx)}
                                                className="absolute top-1 right-1 bg-red-600/90 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Upload Button */}
                                    {(formData.gallery_images?.length || 0) < 5 && (
                                        <label className="aspect-square border-2 border-dashed border-stone-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-haldi-500 hover:bg-stone-900 transition text-stone-500 hover:text-haldi-500">
                                            <UploadCloud size={20} />
                                            <span className="text-[10px] font-bold mt-1">Add Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} disabled={saving} />
                                        </label>
                                    )}
                                </div>

                                {/* MEDIA STUDIO - Audio / Video */}
                                <div className="border-t border-stone-800 pt-6 mt-2">
                                    <h4 className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Video size={14} /> Media Studio
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Voice Intro */}
                                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-stone-400">
                                                <Mic size={16} /> <span className="text-xs font-bold uppercase">Voice Intro</span>
                                            </div>
                                            <input 
                                                name="voice_intro_url" 
                                                value={formData.voice_intro_url || ''} 
                                                onChange={handleChange} 
                                                placeholder="Paste Audio URL..." 
                                                className="bg-transparent border-b border-stone-800 focus:border-haldi-500 outline-none text-sm py-1 text-stone-300"
                                            />
                                            <p className="text-[10px] text-stone-600">e.g. Vocaroo link or Google Drive</p>
                                        </div>

                                        {/* Video Bio */}
                                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-stone-400">
                                                <Video size={16} /> <span className="text-xs font-bold uppercase">Video Bio</span>
                                            </div>
                                            <input 
                                                name="video_intro_url" 
                                                value={formData.video_intro_url || ''} 
                                                onChange={handleChange} 
                                                placeholder="Paste Video URL..." 
                                                className="bg-transparent border-b border-stone-800 focus:border-haldi-500 outline-none text-sm py-1 text-stone-300"
                                            />
                                            <p className="text-[10px] text-stone-600">e.g. YouTube Unlisted or Loom</p>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}