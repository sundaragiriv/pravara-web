-- ============================================================
-- Pravara -- Reference Tables: Seed Data
-- Phase 1B: ref_languages, ref_communities, ref_sub_communities
--           ref_gothras, ref_nakshatras, ref_raasis
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- Run ONCE. Safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING)
-- ============================================================

-- __ CREATE TABLES ____________________________________________

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
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  alt_names    TEXT[],
  veda_shakha  TEXT
);

CREATE TABLE IF NOT EXISTS ref_nakshatras (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  alt_names TEXT[],
  raasi     TEXT,
  raasi2    TEXT,
  gana      TEXT,   -- Deva | Manushya | Rakshasa
  nadi      TEXT,   -- Vata | Pitta | Kapha
  yoni      TEXT,   -- Horse | Elephant | ...
  varna     TEXT,
  lord      TEXT
);

CREATE TABLE IF NOT EXISTS ref_raasis (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  alt_names   TEXT[],
  lord        TEXT,
  vashya      TEXT,
  element     TEXT
);

-- __ SEED: Languages __________________________________________

INSERT INTO ref_languages (id, name) VALUES
  (1, 'Telugu'), (2, 'Tamil'), (3, 'Kannada'),
  (4, 'Hindi'),  (5, 'Marathi'), (6, 'Sanskrit'), (7, 'Other')
ON CONFLICT DO NOTHING;

-- __ SEED: Communities ________________________________________

INSERT INTO ref_communities (id, language_id, name, description) VALUES
  (101, 1, 'Niyogi',       'Secular/administrative Brahmins of Andhra & Telangana'),
  (102, 1, 'Vaidiki',      'Priestly Brahmins, traditionally temple-oriented'),
  (103, 1, 'Srivaishnava', 'Vaishnava Brahmins -- Telugu counterpart of Iyengar'),
  (104, 1, 'Murikinati',   NULL),
  (201, 2, 'Iyer',         'Smartha Brahmins -- followers of Adi Shankaracharya'),
  (202, 2, 'Iyengar',      'Vaishnava Brahmins -- followers of Ramanujacharya'),
  (203, 2, 'Gurukkal',     'Temple priest Brahmins of Tamil Nadu'),
  (301, 3, 'Smartha',      'Smartha Brahmins of Karnataka'),
  (302, 3, 'Madhwa',       'Followers of Madhvacharya (Dvaita philosophy)'),
  (303, 3, 'Shivalli',     'Brahmins of Tulu Nadu (coastal Karnataka)'),
  (401, 4, 'Gaur',         'From Gaud region -- highly respected lineage'),
  (402, 4, 'Kanyakubja',   'From Kanpur / Kannauj region of UP'),
  (403, 4, 'Saryupareen',  'From Sarayu river belt -- Ayodhya region'),
  (404, 4, 'Maithil',      'From Mithila (Bihar / Eastern UP)'),
  (405, 4, 'Kashmiri Pandit', 'Brahmins of Kashmir valley'),
  (406, 4, 'Saraswat',     'Brahmins tracing lineage to Saraswati river'),
  (501, 5, 'Deshastha',    'Brahmins of the Deccan plateau'),
  (502, 5, 'Chitpavan',    'Konkan coast Brahmins'),
  (503, 5, 'Karhade',      NULL),
  (504, 5, 'Saraswat',     'Konkani-speaking Brahmins of coastal Maharashtra/Goa')
ON CONFLICT DO NOTHING;

-- __ SEED: Sub-communities ____________________________________

INSERT INTO ref_sub_communities (id, community_id, name) VALUES
  (1011, 101, 'Velanadu Niyogi'),
  (1012, 101, 'Kammanadu Niyogi'),
  (1013, 101, 'Telangana Niyogi'),
  (1014, 101, 'Dravida Niyogi'),
  (1021, 102, 'Vaidiki'),
  (1022, 102, 'Velanadu Vaidiki'),
  (1023, 102, 'Smarta Vaidiki'),
  (1024, 102, 'Mulakanadu'),
  (2011, 201, 'Vadama'),
  (2012, 201, 'Vathima'),
  (2013, 201, 'Brihacharanam'),
  (2014, 201, 'Ashtasahasram'),
  (2015, 201, 'Mulakanadu'),
  (2021, 202, 'Thenkalai'),
  (2022, 202, 'Vadakalai'),
  (3011, 301, 'Havyaka'),
  (3012, 301, 'Hoysala Karnataka'),
  (3013, 301, 'Kota')
ON CONFLICT DO NOTHING;

-- __ SEED: Gothras ____________________________________________

INSERT INTO ref_gothras (id, name, alt_names, veda_shakha) VALUES
  (1,  'Kashyapa',    ARRAY['kashyap','kasyapa','kasyap'],        'Rigveda'),
  (2,  'Bharadwaja',  ARRAY['bharadvaja','bhardwaj','bharadwaj'], 'Rigveda'),
  (3,  'Atri',        ARRAY['atri','atreyasa'],                   'Rigveda'),
  (4,  'Vishwamitra', ARRAY['vishvamitra','viswamitra'],          'Rigveda'),
  (5,  'Gautama',     ARRAY['gautam','gotama'],                   'Samaveda'),
  (6,  'Jamadagni',   ARRAY['jamadagnasa'],                       'Rigveda'),
  (7,  'Vasishtha',   ARRAY['vasistha','vashishtha','vashishth'], 'Rigveda'),
  (8,  'Agastya',     ARRAY['agasthya','agasthyasa'],             'Rigveda'),
  (9,  'Kaundinya',   ARRAY['kowdilya','kondilya'],               'Yajurveda'),
  (10, 'Sandilya',    ARRAY['shandilya'],                         'Rigveda'),
  (11, 'Parasara',    ARRAY['parashara','parashar'],              'Rigveda'),
  (12, 'Vatsa',       ARRAY['vatsasa'],                           'Yajurveda'),
  (13, 'Garga',       ARRAY['gargasa'],                           'Yajurveda'),
  (14, 'Mudgala',     ARRAY['mudgalasa'],                         'Rigveda'),
  (15, 'Maitreya',    ARRAY['maitreyasa'],                        'Samaveda'),
  (16, 'Kaushika',    ARRAY['kaushik','kausika','koushika'],      'Rigveda'),
  (17, 'Harita',      ARRAY['haritasa'],                          'Samaveda'),
  (18, 'Angirasa',    ARRAY['angiras','angirash'],                'Atharvaveda'),
  (19, 'Vatula',      ARRAY['vatulasa'],                          'Yajurveda'),
  (20, 'Dhananjaya',  ARRAY['dhananjay'],                         'Yajurveda'),
  (21, 'Srivatsa',    ARRAY['srivatsasa'],                        'Samaveda'),
  (22, 'Upamanya',    ARRAY[]::TEXT[],                            'Yajurveda'),
  (23, 'Lohita',      ARRAY['lohitasa'],                          'Yajurveda'),
  (24, 'Shaunaka',    ARRAY['shaunakasa'],                        'Atharvaveda'),
  (25, 'Bhrugu',      ARRAY['bhrigu','bhargava'],                 'Rigveda'),
  (26, 'Pulastya',    ARRAY[]::TEXT[],                            'Rigveda'),
  (27, 'Pulaha',      ARRAY[]::TEXT[],                            'Rigveda'),
  (28, 'Kratu',       ARRAY[]::TEXT[],                            'Rigveda'),
  (29, 'Marichi',     ARRAY['marich'],                            'Rigveda'),
  (30, 'Naidhruva',   ARRAY[]::TEXT[],                            'Yajurveda')
ON CONFLICT DO NOTHING;

-- __ SEED: Raasis _____________________________________________

INSERT INTO ref_raasis (id, name, alt_names, lord, vashya, element) VALUES
  (1,  'Mesha',     ARRAY['aries','mesh'],        'Mars',    'Chatushpada', 'Fire'),
  (2,  'Vrishabha', ARRAY['taurus','vrisabha'],   'Venus',   'Chatushpada', 'Earth'),
  (3,  'Mithuna',   ARRAY['gemini','mithun'],      'Mercury', 'Manava',      'Air'),
  (4,  'Karka',     ARRAY['cancer','karkata'],     'Moon',    'Jalchara',    'Water'),
  (5,  'Simha',     ARRAY['leo','singh'],           'Sun',     'Vanachara',   'Fire'),
  (6,  'Kanya',     ARRAY['virgo','kanni'],         'Mercury', 'Manava',      'Earth'),
  (7,  'Tula',      ARRAY['libra','thula'],         'Venus',   'Manava',      'Air'),
  (8,  'Vrischika', ARRAY['scorpio','vrishchik'],   'Mars',    'Kita',        'Water'),
  (9,  'Dhanu',     ARRAY['sagittarius','dhan'],    'Jupiter', 'Chatushpada', 'Fire'),
  (10, 'Makara',    ARRAY['capricorn','makar'],     'Saturn',  'Jalchara',    'Earth'),
  (11, 'Kumbha',    ARRAY['aquarius','kumbh'],      'Saturn',  'Manava',      'Air'),
  (12, 'Meena',     ARRAY['pisces','meen'],         'Jupiter', 'Jalchara',    'Water')
ON CONFLICT DO NOTHING;

-- __ SEED: Nakshatras _________________________________________

INSERT INTO ref_nakshatras (id, name, alt_names, raasi, raasi2, gana, nadi, yoni, varna, lord) VALUES
  (1,  'Ashwini',          ARRAY['aswini','ashvini'],              'Mesha',     NULL,       'Deva',     'Vata',  'Horse',    'Vaishya',  'Ketu'),
  (2,  'Bharani',          ARRAY['bharini','bhorani'],             'Mesha',     NULL,       'Manushya', 'Pitta', 'Elephant', 'Shudra',   'Venus'),
  (3,  'Krittika',         ARRAY['karthika','kartika','krithika'], 'Mesha',     'Vrishabha','Rakshasa', 'Kapha', 'Sheep',    'Brahmin',  'Sun'),
  (4,  'Rohini',           ARRAY['rohani'],                        'Vrishabha', NULL,       'Manushya', 'Kapha', 'Serpent',  'Shudra',   'Moon'),
  (5,  'Mrigashira',       ARRAY['mrigasira','mrugasira'],         'Vrishabha', 'Mithuna',  'Deva',     'Pitta', 'Serpent',  'Farmer',   'Mars'),
  (6,  'Ardra',            ARRAY['arudra','thiruvathira'],         'Mithuna',   NULL,       'Manushya', 'Vata',  'Dog',      'Butcher',  'Rahu'),
  (7,  'Punarvasu',        ARRAY['punarpoosam','punarpusam'],      'Mithuna',   'Karka',    'Deva',     'Vata',  'Cat',      'Vaishya',  'Jupiter'),
  (8,  'Pushya',           ARRAY['poosam','pushyam','pooyam'],     'Karka',     NULL,       'Deva',     'Pitta', 'Sheep',    'Kshatriya','Saturn'),
  (9,  'Ashlesha',         ARRAY['ayilyam','aslesha'],             'Karka',     NULL,       'Rakshasa', 'Kapha', 'Cat',      'Shudra',   'Mercury'),
  (10, 'Magha',            ARRAY['makha','magam'],                 'Simha',     NULL,       'Rakshasa', 'Kapha', 'Rat',      'Shudra',   'Ketu'),
  (11, 'Purva Phalguni',   ARRAY['pubba','pooram','puram'],        'Simha',     NULL,       'Manushya', 'Pitta', 'Rat',      'Brahmin',  'Venus'),
  (12, 'Uttara Phalguni',  ARRAY['uttara','uthiram'],              'Simha',     'Kanya',    'Manushya', 'Pitta', 'Cow',      'Kshatriya','Sun'),
  (13, 'Hasta',            ARRAY['hastam','atham'],                'Kanya',     NULL,       'Deva',     'Pitta', 'Buffalo',  'Vaishya',  'Moon'),
  (14, 'Chitra',           ARRAY['chithra','chithirai'],           'Kanya',     'Tula',     'Rakshasa', 'Pitta', 'Tiger',    'Farmer',   'Mars'),
  (15, 'Swati',            ARRAY['swathi','chothi'],               'Tula',      NULL,       'Deva',     'Kapha', 'Buffalo',  'Butcher',  'Rahu'),
  (16, 'Vishakha',         ARRAY['visakha','vishakam'],            'Tula',      'Vrischika','Rakshasa', 'Pitta', 'Tiger',    'Shudra',   'Jupiter'),
  (17, 'Anuradha',         ARRAY['anusham','anizham'],             'Vrischika', NULL,       'Deva',     'Pitta', 'Deer',     'Shudra',   'Saturn'),
  (18, 'Jyeshtha',         ARRAY['kettai','triketta'],             'Vrischika', NULL,       'Rakshasa', 'Vata',  'Deer',     'Farmer',   'Mercury'),
  (19, 'Mula',             ARRAY['moola','moolam'],                'Dhanu',     NULL,       'Rakshasa', 'Kapha', 'Dog',      'Butcher',  'Ketu'),
  (20, 'Purva Ashadha',    ARRAY['pooradam','purvashada'],         'Dhanu',     NULL,       'Manushya', 'Pitta', 'Monkey',   'Brahmin',  'Venus'),
  (21, 'Uttara Ashadha',   ARRAY['uttaradam','uttarashada'],       'Dhanu',     'Makara',   'Manushya', 'Pitta', 'Mongoose', 'Kshatriya','Sun'),
  (22, 'Shravana',         ARRAY['sravanam','thiruvonam','sravana'],'Makara',   NULL,       'Deva',     'Kapha', 'Monkey',   'Shudra',   'Moon'),
  (23, 'Dhanishtha',       ARRAY['dhanista','avittam','shravishtha'],'Makara',  'Kumbha',   'Rakshasa', 'Pitta', 'Lion',     'Farmer',   'Mars'),
  (24, 'Shatabhisha',      ARRAY['sadayam','shatataraka'],         'Kumbha',    NULL,       'Rakshasa', 'Vata',  'Horse',    'Butcher',  'Rahu'),
  (25, 'Purva Bhadrapada', ARRAY['poorattathi','purvabhadra'],     'Kumbha',    'Meena',    'Manushya', 'Vata',  'Lion',     'Brahmin',  'Jupiter'),
  (26, 'Uttara Bhadrapada',ARRAY['uttarattathi','uttarabhadra'],   'Meena',     NULL,       'Manushya', 'Pitta', 'Cow',      'Kshatriya','Saturn'),
  (27, 'Revati',           ARRAY['revathi'],                       'Meena',     NULL,       'Deva',     'Kapha', 'Elephant', 'Shudra',   'Mercury')
ON CONFLICT DO NOTHING;

-- __ Verify ___________________________________________________
SELECT 'languages' AS tbl, COUNT(*) FROM ref_languages
UNION ALL SELECT 'communities',    COUNT(*) FROM ref_communities
UNION ALL SELECT 'sub_communities',COUNT(*) FROM ref_sub_communities
UNION ALL SELECT 'gothras',        COUNT(*) FROM ref_gothras
UNION ALL SELECT 'nakshatras',     COUNT(*) FROM ref_nakshatras
UNION ALL SELECT 'raasis',         COUNT(*) FROM ref_raasis;
