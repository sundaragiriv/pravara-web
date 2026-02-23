// types/index.ts
// Central type definitions for Pravara

export interface Profile {
  id: string;
  full_name: string;
  age: number | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  dob: string | null;
  birth_time: string | null;
  birth_place: string | null;
  height: string | null;
  weight: string | null;
  location: string | null;

  // Vedic/Cultural
  gothra: string | null;
  pravara: string | null;
  nakshatra: string | null;
  nakshatra_padam: string | null;
  raasi: string | null;
  sub_community: string | null;
  religious_level: string | null;
  spiritual_org: string[] | null;

  // Professional
  education: string | null;
  profession: string | null;
  employer: string | null;
  visa_status: string | null;

  // Lifestyle
  diet: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Eggetarian' | null;
  smoking: 'Never' | 'Occasionally' | 'Regularly' | null;
  drinking: 'Never' | 'Occasionally' | 'Socially' | null;
  marital_status: 'Never Married' | 'Divorced' | 'Widowed' | 'Awaiting Divorce' | null;

  // Family
  family_details: string | null;

  // Profile Content
  bio: string | null;
  partner_preferences: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
  audio_bio_url: string | null;
  video_bio_url: string | null;

  // Verification
  is_verified?: boolean;
  is_visible?: boolean;
  notifications_enabled?: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Shortlist {
  id: string;
  user_id: string;
  profile_id: string;
  shortlisted_by: string | null;
  note: string | null;
  added_by_email: string | null;
  created_at: string;
}

export interface Collaborator {
  id: string;
  user_id: string;
  collaborator_email: string;
  role: 'Parent' | 'Sibling' | 'Relative';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Endorsement {
  id: string;
  profile_id: string;
  endorser_name: string;
  relation: 'Friend' | 'Sibling' | 'Parent' | 'Colleague' | 'Other';
  comment: string | null;
  created_at: string;
}

export interface ProfilePhoto {
  id: string;
  profile_id: string;
  image_url: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Match types for dashboard
export interface MatchProfile extends Profile {
  score: number;
  connectionStatus?: 'none' | 'sent' | 'received' | 'connected' | 'rejected';
  isShortlisted?: boolean;
}

// Shortlist item with embedded profile
export interface ShortlistItem {
  id: string;
  user_id: string;
  profile_id: string;
  profile: Profile;
  shortlisted_by: string | null;
  note: string | null;
  added_by_email: string | null;
  created_at: string;
}

// Connection with embedded sender/receiver profiles
export interface ConnectionWithProfile extends Connection {
  sender?: Profile;
  receiver?: Profile;
}

// Request item (incoming connection request)
export interface RequestItem extends Connection {
  sender: Profile;
}

// Connected profile (for connections tab)
export interface ConnectedProfile extends Profile {
  connection_id: string;
  connected_at: string;
}

// Chat message type for Sutradhar widget
export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

// Filter types for dashboard
export interface DashboardFilters {
  searchTerm: string;
  minAge: number;
  maxAge: number;
  minHeight: string;
  maxHeight: string;
  location: string;
  community: string;
  gothra: string;
  diet: string[];
  visa: string;
}
