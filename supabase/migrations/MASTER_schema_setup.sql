-- ============================================================
-- PRAVARA — MASTER SCHEMA SETUP
-- Run this ONCE in Supabase SQL Editor to fix all missing columns.
-- 100% idempotent: safe to re-run even if some things already exist.
--
-- Fixes: "Could not find the 'community_id' column of 'profiles'"
-- and all related missing-column errors during onboarding/save.
--
-- Order matters:
--   1. Reference tables (ref_*) must exist before FK columns are added.
--   2. profiles FK columns reference ref_* tables.
--   3. All other profiles columns can be added in any order.
--   4. Notifications FK fix must run last (depends on existing table).
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- STEP 1: REFERENCE TABLES (structure)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ref_languages (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ref_communities (
  id          SERIAL PRIMARY KEY,
  language_id INT REFERENCES ref_languages(id),
  name        TEXT NOT NULL,
  description TEXT,
  UNIQUE(language_id, name)
);

CREATE TABLE IF NOT EXISTS ref_sub_communities (
  id           SERIAL PRIMARY KEY,
  community_id INT REFERENCES ref_communities(id),
  name         TEXT NOT NULL,
  UNIQUE(community_id, name)
);

CREATE TABLE IF NOT EXISTS ref_gothras (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  alt_names   TEXT[],
  veda_shakha TEXT
);

CREATE TABLE IF NOT EXISTS ref_nakshatras (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  alt_names TEXT[],
  raasi     TEXT,
  raasi2    TEXT,
  gana      TEXT,
  nadi      TEXT,
  yoni      TEXT,
  varna     TEXT,
  lord      TEXT
);

CREATE TABLE IF NOT EXISTS ref_raasis (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  alt_names TEXT[],
  lord      TEXT,
  vashya    TEXT,
  element   TEXT
);

CREATE TABLE IF NOT EXISTS ref_yoni_compat (
  yoni_a TEXT NOT NULL,
  yoni_b TEXT NOT NULL,
  score  SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 4),
  PRIMARY KEY (yoni_a, yoni_b)
);

CREATE TABLE IF NOT EXISTS ref_planet_friendship (
  planet_a TEXT NOT NULL,
  planet_b TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('Friend','Neutral','Enemy')),
  PRIMARY KEY (planet_a, planet_b)
);


-- ════════════════════════════════════════════════════════════
-- STEP 2: SEED REFERENCE DATA
-- ════════════════════════════════════════════════════════════

-- Languages
INSERT INTO ref_languages (id, name) VALUES
  (1,'Telugu'),(2,'Tamil'),(3,'Kannada'),
  (4,'Hindi'), (5,'Marathi'),(6,'Sanskrit'),(7,'Other')
ON CONFLICT DO NOTHING;

-- Communities
INSERT INTO ref_communities (id, language_id, name, description) VALUES
  (101,1,'Niyogi',         'Secular/administrative Brahmins of Andhra & Telangana'),
  (102,1,'Vaidiki',        'Priestly Brahmins, traditionally temple-oriented'),
  (103,1,'Srivaishnava',   'Vaishnava Brahmins — Telugu counterpart of Iyengar'),
  (104,1,'Murikinati',     NULL),
  (201,2,'Iyer',           'Smartha Brahmins — followers of Adi Shankaracharya'),
  (202,2,'Iyengar',        'Vaishnava Brahmins — followers of Ramanujacharya'),
  (203,2,'Gurukkal',       'Temple priest Brahmins of Tamil Nadu'),
  (301,3,'Smartha',        'Smartha Brahmins of Karnataka'),
  (302,3,'Madhwa',         'Followers of Madhvacharya (Dvaita philosophy)'),
  (303,3,'Shivalli',       'Brahmins of Tulu Nadu (coastal Karnataka)'),
  (401,4,'Gaur',           'From Gaud region — highly respected lineage'),
  (402,4,'Kanyakubja',     'From Kanpur / Kannauj region of UP'),
  (403,4,'Saryupareen',    'From Sarayu river belt — Ayodhya region'),
  (404,4,'Maithil',        'From Mithila (Bihar / Eastern UP)'),
  (405,4,'Kashmiri Pandit','Brahmins of Kashmir valley'),
  (406,4,'Saraswat',       'Brahmins tracing lineage to Saraswati river'),
  (501,5,'Deshastha',      'Brahmins of the Deccan plateau'),
  (502,5,'Chitpavan',      'Konkan coast Brahmins'),
  (503,5,'Karhade',        NULL),
  (504,5,'Saraswat',       'Konkani-speaking Brahmins of coastal Maharashtra/Goa')
ON CONFLICT DO NOTHING;

-- Sub-communities
INSERT INTO ref_sub_communities (id, community_id, name) VALUES
  (1011,101,'Velanadu Niyogi'),
  (1012,101,'Kammanadu Niyogi'),
  (1013,101,'Telangana Niyogi'),
  (1014,101,'Dravida Niyogi'),
  (1021,102,'Vaidiki'),
  (1022,102,'Velanadu Vaidiki'),
  (1023,102,'Smarta Vaidiki'),
  (1024,102,'Mulakanadu'),
  (2011,201,'Vadama'),
  (2012,201,'Vathima'),
  (2013,201,'Brihacharanam'),
  (2014,201,'Ashtasahasram'),
  (2015,201,'Mulakanadu'),
  (2021,202,'Thenkalai'),
  (2022,202,'Vadakalai'),
  (3011,301,'Havyaka'),
  (3012,301,'Hoysala Karnataka'),
  (3013,301,'Kota')
ON CONFLICT DO NOTHING;

-- Gothras (30)
INSERT INTO ref_gothras (id, name, alt_names, veda_shakha) VALUES
  (1, 'Kashyapa',    ARRAY['kashyap','kasyapa','kasyap'],         'Rigveda'),
  (2, 'Bharadwaja',  ARRAY['bharadvaja','bhardwaj','bharadwaj'],  'Rigveda'),
  (3, 'Atri',        ARRAY['atri','atreyasa'],                    'Rigveda'),
  (4, 'Vishwamitra', ARRAY['vishvamitra','viswamitra'],           'Rigveda'),
  (5, 'Gautama',     ARRAY['gautam','gotama'],                    'Samaveda'),
  (6, 'Jamadagni',   ARRAY['jamadagnasa'],                        'Rigveda'),
  (7, 'Vasishtha',   ARRAY['vasistha','vashishtha','vashishth'],  'Rigveda'),
  (8, 'Agastya',     ARRAY['agasthya','agasthyasa'],              'Rigveda'),
  (9, 'Kaundinya',   ARRAY['kowdilya','kondilya'],                'Yajurveda'),
  (10,'Sandilya',    ARRAY['shandilya'],                          'Rigveda'),
  (11,'Parasara',    ARRAY['parashara','parashar'],               'Rigveda'),
  (12,'Vatsa',       ARRAY['vatsasa'],                            'Yajurveda'),
  (13,'Garga',       ARRAY['gargasa'],                            'Yajurveda'),
  (14,'Mudgala',     ARRAY['mudgalasa'],                          'Rigveda'),
  (15,'Maitreya',    ARRAY['maitreyasa'],                         'Samaveda'),
  (16,'Kaushika',    ARRAY['kaushik','kausika','koushika'],       'Rigveda'),
  (17,'Harita',      ARRAY['haritasa'],                           'Samaveda'),
  (18,'Angirasa',    ARRAY['angiras','angirash'],                 'Atharvaveda'),
  (19,'Vatula',      ARRAY['vatulasa'],                           'Yajurveda'),
  (20,'Dhananjaya',  ARRAY['dhananjay'],                          'Yajurveda'),
  (21,'Srivatsa',    ARRAY['srivatsasa'],                         'Samaveda'),
  (22,'Upamanya',    ARRAY[]::TEXT[],                             'Yajurveda'),
  (23,'Lohita',      ARRAY['lohitasa'],                           'Yajurveda'),
  (24,'Shaunaka',    ARRAY['shaunakasa'],                         'Atharvaveda'),
  (25,'Bhrugu',      ARRAY['bhrigu','bhargava'],                  'Rigveda'),
  (26,'Pulastya',    ARRAY[]::TEXT[],                             'Rigveda'),
  (27,'Pulaha',      ARRAY[]::TEXT[],                             'Rigveda'),
  (28,'Kratu',       ARRAY[]::TEXT[],                             'Rigveda'),
  (29,'Marichi',     ARRAY['marich'],                             'Rigveda'),
  (30,'Naidhruva',   ARRAY[]::TEXT[],                             'Yajurveda')
ON CONFLICT DO NOTHING;

-- Raasis (12)
INSERT INTO ref_raasis (id, name, alt_names, lord, vashya, element) VALUES
  (1, 'Mesha',     ARRAY['aries','mesh'],        'Mars',    'Chatushpada','Fire'),
  (2, 'Vrishabha', ARRAY['taurus','vrisabha'],   'Venus',   'Chatushpada','Earth'),
  (3, 'Mithuna',   ARRAY['gemini','mithun'],     'Mercury', 'Manava',     'Air'),
  (4, 'Karka',     ARRAY['cancer','karkata'],    'Moon',    'Jalchara',   'Water'),
  (5, 'Simha',     ARRAY['leo','singh'],         'Sun',     'Vanachara',  'Fire'),
  (6, 'Kanya',     ARRAY['virgo','kanni'],       'Mercury', 'Manava',     'Earth'),
  (7, 'Tula',      ARRAY['libra','thula'],       'Venus',   'Manava',     'Air'),
  (8, 'Vrischika', ARRAY['scorpio','vrishchik'], 'Mars',    'Kita',       'Water'),
  (9, 'Dhanu',     ARRAY['sagittarius','dhan'],  'Jupiter', 'Chatushpada','Fire'),
  (10,'Makara',    ARRAY['capricorn','makar'],   'Saturn',  'Jalchara',   'Earth'),
  (11,'Kumbha',    ARRAY['aquarius','kumbh'],    'Saturn',  'Manava',     'Air'),
  (12,'Meena',     ARRAY['pisces','meen'],       'Jupiter', 'Jalchara',   'Water')
ON CONFLICT DO NOTHING;

-- Nakshatras (27)
INSERT INTO ref_nakshatras (id, name, alt_names, raasi, raasi2, gana, nadi, yoni, varna, lord) VALUES
  (1, 'Ashwini',          ARRAY['aswini','ashvini'],               'Mesha',     NULL,       'Deva',     'Vata',  'Horse',    'Vaishya',  'Ketu'),
  (2, 'Bharani',          ARRAY['bharini','bhorani'],              'Mesha',     NULL,       'Manushya', 'Pitta', 'Elephant', 'Shudra',   'Venus'),
  (3, 'Krittika',         ARRAY['karthika','kartika','krithika'],  'Mesha',     'Vrishabha','Rakshasa', 'Kapha', 'Sheep',    'Brahmin',  'Sun'),
  (4, 'Rohini',           ARRAY['rohani'],                         'Vrishabha', NULL,       'Manushya', 'Kapha', 'Serpent',  'Shudra',   'Moon'),
  (5, 'Mrigashira',       ARRAY['mrigasira','mrugasira'],          'Vrishabha', 'Mithuna',  'Deva',     'Pitta', 'Serpent',  'Farmer',   'Mars'),
  (6, 'Ardra',            ARRAY['arudra','thiruvathira'],          'Mithuna',   NULL,       'Manushya', 'Vata',  'Dog',      'Butcher',  'Rahu'),
  (7, 'Punarvasu',        ARRAY['punarpoosam','punarpusam'],       'Mithuna',   'Karka',    'Deva',     'Vata',  'Cat',      'Vaishya',  'Jupiter'),
  (8, 'Pushya',           ARRAY['poosam','pushyam','pooyam'],      'Karka',     NULL,       'Deva',     'Pitta', 'Sheep',    'Kshatriya','Saturn'),
  (9, 'Ashlesha',         ARRAY['ayilyam','aslesha'],              'Karka',     NULL,       'Rakshasa', 'Kapha', 'Cat',      'Shudra',   'Mercury'),
  (10,'Magha',            ARRAY['makha','magam'],                  'Simha',     NULL,       'Rakshasa', 'Kapha', 'Rat',      'Shudra',   'Ketu'),
  (11,'Purva Phalguni',   ARRAY['pubba','pooram','puram'],         'Simha',     NULL,       'Manushya', 'Pitta', 'Rat',      'Brahmin',  'Venus'),
  (12,'Uttara Phalguni',  ARRAY['uttara','uthiram'],               'Simha',     'Kanya',    'Manushya', 'Pitta', 'Cow',      'Kshatriya','Sun'),
  (13,'Hasta',            ARRAY['hastam','atham'],                 'Kanya',     NULL,       'Deva',     'Pitta', 'Buffalo',  'Vaishya',  'Moon'),
  (14,'Chitra',           ARRAY['chithra','chithirai'],            'Kanya',     'Tula',     'Rakshasa', 'Pitta', 'Tiger',    'Farmer',   'Mars'),
  (15,'Swati',            ARRAY['swathi','chothi'],                'Tula',      NULL,       'Deva',     'Kapha', 'Buffalo',  'Butcher',  'Rahu'),
  (16,'Vishakha',         ARRAY['visakha','vishakam'],             'Tula',      'Vrischika','Rakshasa', 'Pitta', 'Tiger',    'Shudra',   'Jupiter'),
  (17,'Anuradha',         ARRAY['anusham','anizham'],              'Vrischika', NULL,       'Deva',     'Pitta', 'Deer',     'Shudra',   'Saturn'),
  (18,'Jyeshtha',         ARRAY['kettai','triketta'],              'Vrischika', NULL,       'Rakshasa', 'Vata',  'Deer',     'Farmer',   'Mercury'),
  (19,'Mula',             ARRAY['moola','moolam'],                 'Dhanu',     NULL,       'Rakshasa', 'Kapha', 'Dog',      'Butcher',  'Ketu'),
  (20,'Purva Ashadha',    ARRAY['pooradam','purvashada'],          'Dhanu',     NULL,       'Manushya', 'Pitta', 'Monkey',   'Brahmin',  'Venus'),
  (21,'Uttara Ashadha',   ARRAY['uttaradam','uttarashada'],        'Dhanu',     'Makara',   'Manushya', 'Pitta', 'Mongoose', 'Kshatriya','Sun'),
  (22,'Shravana',         ARRAY['sravanam','thiruvonam','sravana'],'Makara',    NULL,       'Deva',     'Kapha', 'Monkey',   'Shudra',   'Moon'),
  (23,'Dhanishtha',       ARRAY['dhanista','avittam','shravishtha'],'Makara',   'Kumbha',   'Rakshasa', 'Pitta', 'Lion',     'Farmer',   'Mars'),
  (24,'Shatabhisha',      ARRAY['sadayam','shatataraka'],          'Kumbha',    NULL,       'Rakshasa', 'Vata',  'Horse',    'Butcher',  'Rahu'),
  (25,'Purva Bhadrapada', ARRAY['poorattathi','purvabhadra'],      'Kumbha',    'Meena',    'Manushya', 'Vata',  'Lion',     'Brahmin',  'Jupiter'),
  (26,'Uttara Bhadrapada',ARRAY['uttarattathi','uttarabhadra'],    'Meena',     NULL,       'Manushya', 'Pitta', 'Cow',      'Kshatriya','Saturn'),
  (27,'Revati',           ARRAY['revathi'],                        'Meena',     NULL,       'Deva',     'Kapha', 'Elephant', 'Shudra',   'Mercury')
ON CONFLICT DO NOTHING;

-- Yoni compatibility matrix (196 rows)
INSERT INTO ref_yoni_compat (yoni_a, yoni_b, score) VALUES
  ('Horse','Horse',4),('Horse','Elephant',3),('Horse','Sheep',3),('Horse','Serpent',2),
  ('Horse','Dog',2),('Horse','Cat',2),('Horse','Rat',2),('Horse','Cow',2),
  ('Horse','Mongoose',2),('Horse','Monkey',2),('Horse','Tiger',2),('Horse','Hare',2),
  ('Horse','Lion',1),('Horse','Buffalo',0),
  ('Elephant','Elephant',4),('Elephant','Horse',3),('Elephant','Sheep',3),('Elephant','Serpent',2),
  ('Elephant','Dog',2),('Elephant','Cat',2),('Elephant','Rat',2),('Elephant','Cow',2),
  ('Elephant','Mongoose',2),('Elephant','Monkey',2),('Elephant','Tiger',2),('Elephant','Hare',2),
  ('Elephant','Buffalo',1),('Elephant','Lion',0),
  ('Sheep','Sheep',4),('Sheep','Horse',3),('Sheep','Elephant',3),('Sheep','Serpent',2),
  ('Sheep','Dog',2),('Sheep','Cat',2),('Sheep','Rat',2),('Sheep','Cow',2),
  ('Sheep','Mongoose',2),('Sheep','Tiger',2),('Sheep','Hare',2),('Sheep','Buffalo',2),
  ('Sheep','Lion',2),('Sheep','Monkey',0),
  ('Serpent','Serpent',4),('Serpent','Horse',2),('Serpent','Elephant',2),('Serpent','Sheep',2),
  ('Serpent','Dog',2),('Serpent','Cat',3),('Serpent','Rat',2),('Serpent','Cow',2),
  ('Serpent','Tiger',2),('Serpent','Hare',2),('Serpent','Buffalo',2),('Serpent','Lion',2),
  ('Serpent','Monkey',2),('Serpent','Mongoose',0),
  ('Dog','Dog',4),('Dog','Horse',2),('Dog','Elephant',2),('Dog','Sheep',2),
  ('Dog','Serpent',2),('Dog','Cat',2),('Dog','Rat',2),('Dog','Cow',2),
  ('Dog','Mongoose',2),('Dog','Monkey',2),('Dog','Tiger',2),('Dog','Buffalo',2),
  ('Dog','Lion',2),('Dog','Hare',0),
  ('Cat','Cat',4),('Cat','Serpent',3),('Cat','Horse',2),('Cat','Elephant',2),
  ('Cat','Sheep',2),('Cat','Dog',2),('Cat','Cow',2),('Cat','Mongoose',2),
  ('Cat','Monkey',2),('Cat','Tiger',2),('Cat','Hare',2),('Cat','Buffalo',2),
  ('Cat','Lion',2),('Cat','Rat',0),
  ('Rat','Rat',4),('Rat','Cow',3),('Rat','Horse',2),('Rat','Elephant',2),
  ('Rat','Sheep',2),('Rat','Serpent',2),('Rat','Dog',2),('Rat','Mongoose',2),
  ('Rat','Monkey',2),('Rat','Tiger',2),('Rat','Hare',2),('Rat','Buffalo',2),
  ('Rat','Lion',2),('Rat','Cat',0),
  ('Cow','Cow',4),('Cow','Rat',3),('Cow','Horse',2),('Cow','Elephant',2),
  ('Cow','Sheep',2),('Cow','Serpent',2),('Cow','Dog',2),('Cow','Cat',2),
  ('Cow','Mongoose',2),('Cow','Monkey',2),('Cow','Hare',2),('Cow','Buffalo',2),
  ('Cow','Lion',2),('Cow','Tiger',0),
  ('Mongoose','Mongoose',4),('Mongoose','Horse',2),('Mongoose','Elephant',2),('Mongoose','Sheep',2),
  ('Mongoose','Dog',2),('Mongoose','Cat',2),('Mongoose','Rat',2),('Mongoose','Cow',2),
  ('Mongoose','Tiger',2),('Mongoose','Hare',2),('Mongoose','Buffalo',2),('Mongoose','Lion',2),
  ('Mongoose','Monkey',2),('Mongoose','Serpent',0),
  ('Monkey','Monkey',4),('Monkey','Horse',2),('Monkey','Elephant',2),('Monkey','Serpent',2),
  ('Monkey','Dog',2),('Monkey','Cat',2),('Monkey','Rat',2),('Monkey','Cow',2),
  ('Monkey','Mongoose',2),('Monkey','Tiger',2),('Monkey','Hare',2),('Monkey','Buffalo',2),
  ('Monkey','Lion',2),('Monkey','Sheep',0),
  ('Tiger','Tiger',4),('Tiger','Horse',2),('Tiger','Elephant',2),('Tiger','Sheep',2),
  ('Tiger','Serpent',2),('Tiger','Dog',2),('Tiger','Cat',2),('Tiger','Rat',2),
  ('Tiger','Mongoose',2),('Tiger','Monkey',2),('Tiger','Hare',2),('Tiger','Buffalo',2),
  ('Tiger','Lion',1),('Tiger','Cow',0),
  ('Hare','Hare',4),('Hare','Horse',2),('Hare','Elephant',2),('Hare','Sheep',2),
  ('Hare','Serpent',2),('Hare','Cat',2),('Hare','Rat',2),('Hare','Cow',2),
  ('Hare','Mongoose',2),('Hare','Monkey',2),('Hare','Tiger',2),('Hare','Buffalo',2),
  ('Hare','Lion',2),('Hare','Dog',0),
  ('Buffalo','Buffalo',4),('Buffalo','Elephant',1),('Buffalo','Sheep',2),('Buffalo','Serpent',2),
  ('Buffalo','Dog',2),('Buffalo','Cat',2),('Buffalo','Rat',2),('Buffalo','Cow',2),
  ('Buffalo','Mongoose',2),('Buffalo','Monkey',2),('Buffalo','Tiger',2),('Buffalo','Hare',2),
  ('Buffalo','Lion',2),('Buffalo','Horse',0),
  ('Lion','Lion',4),('Lion','Horse',1),('Lion','Sheep',2),('Lion','Serpent',2),
  ('Lion','Dog',2),('Lion','Cat',2),('Lion','Rat',2),('Lion','Cow',2),
  ('Lion','Mongoose',2),('Lion','Monkey',2),('Lion','Tiger',1),('Lion','Hare',2),
  ('Lion','Buffalo',2),('Lion','Elephant',0)
ON CONFLICT DO NOTHING;

-- Planet friendship matrix (49 rows)
INSERT INTO ref_planet_friendship (planet_a, planet_b, relation) VALUES
  ('Sun','Sun','Friend'),('Sun','Moon','Friend'),('Sun','Mars','Friend'),
  ('Sun','Mercury','Neutral'),('Sun','Jupiter','Friend'),('Sun','Venus','Enemy'),('Sun','Saturn','Enemy'),
  ('Moon','Sun','Friend'),('Moon','Moon','Friend'),('Moon','Mars','Neutral'),
  ('Moon','Mercury','Friend'),('Moon','Jupiter','Friend'),('Moon','Venus','Neutral'),('Moon','Saturn','Neutral'),
  ('Mars','Sun','Friend'),('Mars','Moon','Neutral'),('Mars','Mars','Friend'),
  ('Mars','Mercury','Enemy'),('Mars','Jupiter','Friend'),('Mars','Venus','Neutral'),('Mars','Saturn','Neutral'),
  ('Mercury','Sun','Neutral'),('Mercury','Moon','Neutral'),('Mercury','Mars','Neutral'),
  ('Mercury','Mercury','Friend'),('Mercury','Jupiter','Neutral'),('Mercury','Venus','Friend'),('Mercury','Saturn','Neutral'),
  ('Jupiter','Sun','Friend'),('Jupiter','Moon','Friend'),('Jupiter','Mars','Friend'),
  ('Jupiter','Mercury','Enemy'),('Jupiter','Jupiter','Friend'),('Jupiter','Venus','Enemy'),('Jupiter','Saturn','Neutral'),
  ('Venus','Sun','Neutral'),('Venus','Moon','Neutral'),('Venus','Mars','Neutral'),
  ('Venus','Mercury','Friend'),('Venus','Jupiter','Neutral'),('Venus','Venus','Friend'),('Venus','Saturn','Friend'),
  ('Saturn','Sun','Neutral'),('Saturn','Moon','Neutral'),('Saturn','Mars','Neutral'),
  ('Saturn','Mercury','Friend'),('Saturn','Jupiter','Neutral'),('Saturn','Venus','Friend'),('Saturn','Saturn','Friend')
ON CONFLICT DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 3: PROFILES — ALL MISSING COLUMNS
-- ════════════════════════════════════════════════════════════

-- Basic fields (signup / onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone                TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender               TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_created_for  TEXT DEFAULT 'Self';

-- Biodata fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marital_status       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob                  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_time           TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_place          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nakshatra_padam      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nakshatra_padam_num  SMALLINT CHECK (nakshatra_padam_num BETWEEN 1 AND 4);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visa_status          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_details       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employer             TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pravara              TEXT;

-- FK columns (community hierarchy + Vedic attributes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_id          INT REFERENCES ref_languages(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_id         INT REFERENCES ref_communities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_community_id     INT REFERENCES ref_sub_communities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nakshatra_id         INT REFERENCES ref_nakshatras(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS raasi_id             INT REFERENCES ref_raasis(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gothra_id            INT REFERENCES ref_gothras(id);

-- Geographic fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country              TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state                TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_city         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_state        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_origin_state  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_at_home_id  INT REFERENCES ref_languages(id);

-- Partner preference fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_min_age          SMALLINT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_max_age          SMALLINT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_language_id      INT REFERENCES ref_languages(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_community_id     INT REFERENCES ref_communities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_diet             TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_marital_status   TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_location_pref    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_education_min    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_notes            TEXT;

-- Media fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS voice_intro_url      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_intro_url      TEXT;

-- Membership fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier       TEXT NOT NULL DEFAULT 'Basic'
  CHECK (membership_tier IN ('Basic','Gold','Concierge'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date   TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_billing    TEXT DEFAULT 'monthly'
  CHECK (subscription_billing IN ('monthly','annual'));

-- Ensure existing rows have 'Basic' membership tier
UPDATE profiles SET membership_tier = 'Basic' WHERE membership_tier IS NULL;


-- ════════════════════════════════════════════════════════════
-- STEP 4: SHORTLIST — missing column + clean RLS rebuild
-- ════════════════════════════════════════════════════════════

ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS added_by_email TEXT;

-- Drop ALL known policy name variants before rebuilding
DROP POLICY IF EXISTS "Safe Modify Shortlist"                   ON shortlists;
DROP POLICY IF EXISTS "Users can delete own shortlist"          ON shortlists;
DROP POLICY IF EXISTS "Users can delete their own shortlist"    ON shortlists;
DROP POLICY IF EXISTS "Users can delete their shortlists"       ON shortlists;
DROP POLICY IF EXISTS "shortlists_delete"                       ON shortlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users"   ON shortlists;
DROP POLICY IF EXISTS "Users can create own shortlist"          ON shortlists;
DROP POLICY IF EXISTS "Users can insert their own shortlist"    ON shortlists;
DROP POLICY IF EXISTS "Users can add to shortlists"             ON shortlists;
DROP POLICY IF EXISTS "shortlists_insert"                       ON shortlists;
DROP POLICY IF EXISTS "Users can view their own shortlist"      ON shortlists;
DROP POLICY IF EXISTS "Users can view their shortlists"         ON shortlists;
DROP POLICY IF EXISTS "Users can view their own shortlists"     ON shortlists;
DROP POLICY IF EXISTS "Safe View Shortlist"                     ON shortlists;
DROP POLICY IF EXISTS "shortlists_select"                       ON shortlists;
DROP POLICY IF EXISTS "Users can view own or family shortlists" ON shortlists;
DROP POLICY IF EXISTS "shortlists_update"                       ON shortlists;
DROP POLICY IF EXISTS "Users can update their shortlists"       ON shortlists;

-- Rebuild: 4 clean policies
CREATE POLICY "shortlists_select"
  ON shortlists FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "shortlists_insert"
  ON shortlists FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborators c
      WHERE c.collaborator_email = auth.email()
        AND c.user_id            = shortlists.user_id
        AND c.status             = 'accepted'
    )
  );

CREATE POLICY "shortlists_delete"
  ON shortlists FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR added_by_email = auth.email()
  );

CREATE POLICY "shortlists_update"
  ON shortlists FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ════════════════════════════════════════════════════════════
-- STEP 5: NOTIFICATIONS — fix FK to auth.users
-- ════════════════════════════════════════════════════════════

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_receiver_id_fkey;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ════════════════════════════════════════════════════════════
-- STEP 6: INDEXES (all idempotent)
-- ════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_language_id    ON profiles(language_id);
CREATE INDEX IF NOT EXISTS idx_profiles_community_id   ON profiles(community_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nakshatra_id   ON profiles(nakshatra_id);
CREATE INDEX IF NOT EXISTS idx_profiles_raasi_id       ON profiles(raasi_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gothra_id      ON profiles(gothra_id);
CREATE INDEX IF NOT EXISTS idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX IF NOT EXISTS idx_profiles_visa_status    ON profiles(visa_status);
CREATE INDEX IF NOT EXISTS idx_profiles_membership     ON profiles(membership_tier);


-- ════════════════════════════════════════════════════════════
-- STEP 7: VERIFY — run this to confirm everything looks right
-- ════════════════════════════════════════════════════════════

SELECT 'ref_languages'      AS tbl, COUNT(*) AS rows FROM ref_languages
UNION ALL SELECT 'ref_communities',     COUNT(*) FROM ref_communities
UNION ALL SELECT 'ref_sub_communities', COUNT(*) FROM ref_sub_communities
UNION ALL SELECT 'ref_gothras',         COUNT(*) FROM ref_gothras
UNION ALL SELECT 'ref_nakshatras',      COUNT(*) FROM ref_nakshatras
UNION ALL SELECT 'ref_raasis',          COUNT(*) FROM ref_raasis
UNION ALL SELECT 'ref_yoni_compat',     COUNT(*) FROM ref_yoni_compat
UNION ALL SELECT 'ref_planet_friendship',COUNT(*) FROM ref_planet_friendship;
-- Expected: 7, 20, 18, 30, 27, 12, 196, 49

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'language_id','community_id','sub_community_id',
    'nakshatra_id','raasi_id','gothra_id',
    'country','state','partner_notes','voice_intro_url',
    'membership_tier','phone','marital_status'
  )
ORDER BY column_name;
-- Should return 13 rows — one per column listed above
