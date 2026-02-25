-- ============================================================
-- Pravara -- Ashtakoot Compatibility Reference Tables
-- Phase 1B-SQL (Part 2): Yoni Matrix + Planetary Friendship
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- Run ONCE. Safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING)
-- ============================================================

-- ── ref_yoni_compat : Kuta 4 — Yoni (max 4 points) ────────────────────────
-- 14 Yoni animal pairings. Score = intimate/biological compatibility.
-- Enemy pairs: Cat↔Rat, Dog↔Hare, Cow↔Tiger, Mongoose↔Serpent,
--              Horse↔Buffalo, Elephant↔Lion, Monkey↔Sheep

CREATE TABLE IF NOT EXISTS ref_yoni_compat (
  yoni_a TEXT NOT NULL,
  yoni_b TEXT NOT NULL,
  score  SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 4),
  PRIMARY KEY (yoni_a, yoni_b)
);

-- Full 14×14 symmetric matrix seeded as (A,B) and (B,A) pairs
INSERT INTO ref_yoni_compat (yoni_a, yoni_b, score) VALUES
  -- Horse (Ashwini, Shatabhisha)
  ('Horse',    'Horse',    4),
  ('Horse',    'Elephant', 3),
  ('Horse',    'Sheep',    3),
  ('Horse',    'Serpent',  2),
  ('Horse',    'Dog',      2),
  ('Horse',    'Cat',      2),
  ('Horse',    'Rat',      2),
  ('Horse',    'Cow',      2),
  ('Horse',    'Mongoose', 2),
  ('Horse',    'Monkey',   2),
  ('Horse',    'Tiger',    2),
  ('Horse',    'Hare',     2),
  ('Horse',    'Lion',     1),
  ('Horse',    'Buffalo',  0),  -- sworn enemy

  -- Elephant (Bharani, Revati)
  ('Elephant', 'Elephant', 4),
  ('Elephant', 'Horse',    3),
  ('Elephant', 'Sheep',    3),
  ('Elephant', 'Serpent',  2),
  ('Elephant', 'Dog',      2),
  ('Elephant', 'Cat',      2),
  ('Elephant', 'Rat',      2),
  ('Elephant', 'Cow',      2),
  ('Elephant', 'Mongoose', 2),
  ('Elephant', 'Monkey',   2),
  ('Elephant', 'Tiger',    2),
  ('Elephant', 'Hare',     2),
  ('Elephant', 'Buffalo',  1),
  ('Elephant', 'Lion',     0),  -- sworn enemy

  -- Sheep / Goat (Krittika, Pushya)
  ('Sheep',    'Sheep',    4),
  ('Sheep',    'Horse',    3),
  ('Sheep',    'Elephant', 3),
  ('Sheep',    'Serpent',  2),
  ('Sheep',    'Dog',      2),
  ('Sheep',    'Cat',      2),
  ('Sheep',    'Rat',      2),
  ('Sheep',    'Cow',      2),
  ('Sheep',    'Mongoose', 2),
  ('Sheep',    'Tiger',    2),
  ('Sheep',    'Hare',     2),
  ('Sheep',    'Buffalo',  2),
  ('Sheep',    'Lion',     2),
  ('Sheep',    'Monkey',   0),  -- sworn enemy

  -- Serpent (Rohini, Mrigashira)
  ('Serpent',  'Serpent',  4),
  ('Serpent',  'Horse',    2),
  ('Serpent',  'Elephant', 2),
  ('Serpent',  'Sheep',    2),
  ('Serpent',  'Dog',      2),
  ('Serpent',  'Cat',      3),
  ('Serpent',  'Rat',      2),
  ('Serpent',  'Cow',      2),
  ('Serpent',  'Tiger',    2),
  ('Serpent',  'Hare',     2),
  ('Serpent',  'Buffalo',  2),
  ('Serpent',  'Lion',     2),
  ('Serpent',  'Monkey',   2),
  ('Serpent',  'Mongoose', 0),  -- sworn enemy

  -- Dog (Ardra, Mula)
  ('Dog',      'Dog',      4),
  ('Dog',      'Horse',    2),
  ('Dog',      'Elephant', 2),
  ('Dog',      'Sheep',    2),
  ('Dog',      'Serpent',  2),
  ('Dog',      'Cat',      2),
  ('Dog',      'Rat',      2),
  ('Dog',      'Cow',      2),
  ('Dog',      'Mongoose', 2),
  ('Dog',      'Monkey',   2),
  ('Dog',      'Tiger',    2),
  ('Dog',      'Buffalo',  2),
  ('Dog',      'Lion',     2),
  ('Dog',      'Hare',     0),  -- sworn enemy

  -- Cat (Punarvasu, Ashlesha)
  ('Cat',      'Cat',      4),
  ('Cat',      'Serpent',  3),
  ('Cat',      'Horse',    2),
  ('Cat',      'Elephant', 2),
  ('Cat',      'Sheep',    2),
  ('Cat',      'Dog',      2),
  ('Cat',      'Cow',      2),
  ('Cat',      'Mongoose', 2),
  ('Cat',      'Monkey',   2),
  ('Cat',      'Tiger',    2),
  ('Cat',      'Hare',     2),
  ('Cat',      'Buffalo',  2),
  ('Cat',      'Lion',     2),
  ('Cat',      'Rat',      0),  -- sworn enemy

  -- Rat (Magha, Purva Phalguni)
  ('Rat',      'Rat',      4),
  ('Rat',      'Horse',    2),
  ('Rat',      'Elephant', 2),
  ('Rat',      'Sheep',    2),
  ('Rat',      'Serpent',  2),
  ('Rat',      'Dog',      2),
  ('Rat',      'Cow',      3),
  ('Rat',      'Mongoose', 2),
  ('Rat',      'Monkey',   2),
  ('Rat',      'Tiger',    2),
  ('Rat',      'Hare',     2),
  ('Rat',      'Buffalo',  2),
  ('Rat',      'Lion',     2),
  ('Rat',      'Cat',      0),  -- sworn enemy

  -- Cow (Uttara Phalguni, Uttara Bhadrapada)
  ('Cow',      'Cow',      4),
  ('Cow',      'Rat',      3),
  ('Cow',      'Horse',    2),
  ('Cow',      'Elephant', 2),
  ('Cow',      'Sheep',    2),
  ('Cow',      'Serpent',  2),
  ('Cow',      'Dog',      2),
  ('Cow',      'Cat',      2),
  ('Cow',      'Mongoose', 2),
  ('Cow',      'Monkey',   2),
  ('Cow',      'Hare',     2),
  ('Cow',      'Buffalo',  2),
  ('Cow',      'Lion',     2),
  ('Cow',      'Tiger',    0),  -- sworn enemy

  -- Mongoose (Uttara Ashadha)
  ('Mongoose', 'Mongoose', 4),
  ('Mongoose', 'Horse',    2),
  ('Mongoose', 'Elephant', 2),
  ('Mongoose', 'Sheep',    2),
  ('Mongoose', 'Dog',      2),
  ('Mongoose', 'Cat',      2),
  ('Mongoose', 'Rat',      2),
  ('Mongoose', 'Cow',      2),
  ('Mongoose', 'Tiger',    2),
  ('Mongoose', 'Hare',     2),
  ('Mongoose', 'Buffalo',  2),
  ('Mongoose', 'Lion',     2),
  ('Mongoose', 'Monkey',   2),
  ('Mongoose', 'Serpent',  0),  -- sworn enemy

  -- Monkey (Purva Ashadha, Shravana)
  ('Monkey',   'Monkey',   4),
  ('Monkey',   'Horse',    2),
  ('Monkey',   'Elephant', 2),
  ('Monkey',   'Serpent',  2),
  ('Monkey',   'Dog',      2),
  ('Monkey',   'Cat',      2),
  ('Monkey',   'Rat',      2),
  ('Monkey',   'Cow',      2),
  ('Monkey',   'Mongoose', 2),
  ('Monkey',   'Tiger',    2),
  ('Monkey',   'Hare',     2),
  ('Monkey',   'Buffalo',  2),
  ('Monkey',   'Lion',     2),
  ('Monkey',   'Sheep',    0),  -- sworn enemy

  -- Tiger (Chitra, Vishakha)
  ('Tiger',    'Tiger',    4),
  ('Tiger',    'Horse',    2),
  ('Tiger',    'Elephant', 2),
  ('Tiger',    'Sheep',    2),
  ('Tiger',    'Serpent',  2),
  ('Tiger',    'Dog',      2),
  ('Tiger',    'Cat',      2),
  ('Tiger',    'Rat',      2),
  ('Tiger',    'Mongoose', 2),
  ('Tiger',    'Monkey',   2),
  ('Tiger',    'Hare',     2),
  ('Tiger',    'Buffalo',  2),
  ('Tiger',    'Lion',     1),
  ('Tiger',    'Cow',      0),  -- sworn enemy

  -- Hare / Deer (Anuradha, Jyeshtha)
  ('Hare',     'Hare',     4),
  ('Hare',     'Horse',    2),
  ('Hare',     'Elephant', 2),
  ('Hare',     'Sheep',    2),
  ('Hare',     'Serpent',  2),
  ('Hare',     'Cat',      2),
  ('Hare',     'Rat',      2),
  ('Hare',     'Cow',      2),
  ('Hare',     'Mongoose', 2),
  ('Hare',     'Monkey',   2),
  ('Hare',     'Tiger',    2),
  ('Hare',     'Buffalo',  2),
  ('Hare',     'Lion',     2),
  ('Hare',     'Dog',      0),  -- sworn enemy

  -- Buffalo (Hasta, Swati)
  ('Buffalo',  'Buffalo',  4),
  ('Buffalo',  'Elephant', 1),
  ('Buffalo',  'Sheep',    2),
  ('Buffalo',  'Serpent',  2),
  ('Buffalo',  'Dog',      2),
  ('Buffalo',  'Cat',      2),
  ('Buffalo',  'Rat',      2),
  ('Buffalo',  'Cow',      2),
  ('Buffalo',  'Mongoose', 2),
  ('Buffalo',  'Monkey',   2),
  ('Buffalo',  'Tiger',    2),
  ('Buffalo',  'Hare',     2),
  ('Buffalo',  'Lion',     2),
  ('Buffalo',  'Horse',    0),  -- sworn enemy

  -- Lion (Dhanishtha, Purva Bhadrapada)
  ('Lion',     'Lion',     4),
  ('Lion',     'Horse',    1),
  ('Lion',     'Sheep',    2),
  ('Lion',     'Serpent',  2),
  ('Lion',     'Dog',      2),
  ('Lion',     'Cat',      2),
  ('Lion',     'Rat',      2),
  ('Lion',     'Cow',      2),
  ('Lion',     'Mongoose', 2),
  ('Lion',     'Monkey',   2),
  ('Lion',     'Tiger',    1),
  ('Lion',     'Hare',     2),
  ('Lion',     'Buffalo',  2),
  ('Lion',     'Elephant', 0)   -- sworn enemy
ON CONFLICT DO NOTHING;


-- ── ref_planet_friendship : Kuta 5 — Graha Maitri (max 5 points) ──────────
-- 7 planets × 7 = 49 rows. relation: Friend | Neutral | Enemy

CREATE TABLE IF NOT EXISTS ref_planet_friendship (
  planet_a TEXT NOT NULL,
  planet_b TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('Friend','Neutral','Enemy')),
  PRIMARY KEY (planet_a, planet_b)
);

INSERT INTO ref_planet_friendship (planet_a, planet_b, relation) VALUES
  -- Sun
  ('Sun',     'Sun',     'Friend'),   -- same planet treated as friend
  ('Sun',     'Moon',    'Friend'),
  ('Sun',     'Mars',    'Friend'),
  ('Sun',     'Mercury', 'Neutral'),
  ('Sun',     'Jupiter', 'Friend'),
  ('Sun',     'Venus',   'Enemy'),
  ('Sun',     'Saturn',  'Enemy'),
  -- Moon
  ('Moon',    'Sun',     'Friend'),
  ('Moon',    'Moon',    'Friend'),
  ('Moon',    'Mars',    'Neutral'),
  ('Moon',    'Mercury', 'Friend'),
  ('Moon',    'Jupiter', 'Friend'),
  ('Moon',    'Venus',   'Neutral'),
  ('Moon',    'Saturn',  'Neutral'),
  -- Mars
  ('Mars',    'Sun',     'Friend'),
  ('Mars',    'Moon',    'Neutral'),
  ('Mars',    'Mars',    'Friend'),
  ('Mars',    'Mercury', 'Enemy'),
  ('Mars',    'Jupiter', 'Friend'),
  ('Mars',    'Venus',   'Neutral'),
  ('Mars',    'Saturn',  'Neutral'),
  -- Mercury
  ('Mercury', 'Sun',     'Neutral'),
  ('Mercury', 'Moon',    'Neutral'),
  ('Mercury', 'Mars',    'Neutral'),
  ('Mercury', 'Mercury', 'Friend'),
  ('Mercury', 'Jupiter', 'Neutral'),
  ('Mercury', 'Venus',   'Friend'),
  ('Mercury', 'Saturn',  'Neutral'),
  -- Jupiter
  ('Jupiter', 'Sun',     'Friend'),
  ('Jupiter', 'Moon',    'Friend'),
  ('Jupiter', 'Mars',    'Friend'),
  ('Jupiter', 'Mercury', 'Enemy'),
  ('Jupiter', 'Jupiter', 'Friend'),
  ('Jupiter', 'Venus',   'Enemy'),
  ('Jupiter', 'Saturn',  'Neutral'),
  -- Venus
  ('Venus',   'Sun',     'Neutral'),
  ('Venus',   'Moon',    'Neutral'),
  ('Venus',   'Mars',    'Neutral'),
  ('Venus',   'Mercury', 'Friend'),
  ('Venus',   'Jupiter', 'Neutral'),
  ('Venus',   'Venus',   'Friend'),
  ('Venus',   'Saturn',  'Friend'),
  -- Saturn
  ('Saturn',  'Sun',     'Neutral'),
  ('Saturn',  'Moon',    'Neutral'),
  ('Saturn',  'Mars',    'Neutral'),
  ('Saturn',  'Mercury', 'Friend'),
  ('Saturn',  'Jupiter', 'Neutral'),
  ('Saturn',  'Venus',   'Friend'),
  ('Saturn',  'Saturn',  'Friend')
ON CONFLICT DO NOTHING;


-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT 'ref_yoni_compat'       AS tbl, COUNT(*) FROM ref_yoni_compat
UNION ALL
SELECT 'ref_planet_friendship' AS tbl, COUNT(*) FROM ref_planet_friendship;
-- Expected: 196, 49
