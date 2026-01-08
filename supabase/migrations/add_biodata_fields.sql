-- Add WhatsApp-style Bio-Data fields to profiles table
-- These fields enable comprehensive horoscope matching and family details

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS dob TEXT,
ADD COLUMN IF NOT EXISTS birth_time TEXT,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS nakshatra_padam TEXT,
ADD COLUMN IF NOT EXISTS visa_status TEXT,
ADD COLUMN IF NOT EXISTS family_details TEXT,
ADD COLUMN IF NOT EXISTS employer TEXT;

-- Add index for commonly filtered fields
CREATE INDEX IF NOT EXISTS idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX IF NOT EXISTS idx_profiles_visa_status ON profiles(visa_status);

-- Add comment for documentation
COMMENT ON COLUMN profiles.marital_status IS 'Current marital status: Never Married, Divorced, Widowed';
COMMENT ON COLUMN profiles.dob IS 'Date of birth in DD/MM/YYYY format';
COMMENT ON COLUMN profiles.birth_time IS 'Birth time in HH:MM AM/PM format for horoscope';
COMMENT ON COLUMN profiles.birth_place IS 'Place of birth (city/town) for horoscope';
COMMENT ON COLUMN profiles.nakshatra_padam IS 'Quarter/Pada (1-4) of the Nakshatra';
COMMENT ON COLUMN profiles.visa_status IS 'Visa/Residency status (Citizen, Green Card, H1B, etc.)';
COMMENT ON COLUMN profiles.family_details IS 'Family background: Parents names, occupations, siblings info';
COMMENT ON COLUMN profiles.employer IS 'Current employer/company name';
