# Brahmin community reference data — research findings

Research commissioned 2026-08-16 to expand `ref_communities` (20 rows, South-heavy)
and `ref_gothras` (30 rows). Kerala and Karnataka/Tulu completed; North India and
gotra research were still running when this was written.

> **None of this is validated.** Every entry below needs review by someone from
> the community before it goes in a dropdown. The researchers found several cases
> where widely-repeated classifications are wrong, contested, or offensive — see
> "Traps" below. Getting one of these wrong in front of a Brahmin family is a
> credibility failure we would not recover from quickly.

---

## The finding that changes our design

Both researchers, independently, concluded that **a caste tree is the wrong data model** —
and that the major Indian matrimonial sites get this wrong today.

**1. Communities genuinely span traditions.** Badaganadu, Shivalli, Ulucha Kamme and
Deshastha all contain both Smarta and Madhwa families, and Badaganadu families
intermarry across that line. Nesting sub-community beneath Smarta/Madhwa
misclassifies real families.

**2. Existing "subcaste" dropdowns mix four different kinds of thing.** On
BrahminMatrimony, the same list contains Shivalli (a community), Sri Uttaradi (a
*matha*), Rigvedi (a *Veda/shakha*), and Sri Rayaru (a reverential name for
Raghavendra Swami — a duplicate of another option in the same list).

**3. Regional parent categories contradict the sources.** Kota, Koteshwara,
Havyaka and even Shivalli are filed under Kannada by some sources and Tulu by
others. Any exclusive tree tells some families they picked the wrong branch.

### Recommended model

| Field | Type | Note |
| --- | --- | --- |
| Community | searchable autocomplete + "not listed" free text | flat list; region and language as descriptive metadata, not parent nodes |
| Tradition | optional select | Smarta / Madhwa / Sri Vaishnava |
| Matha | optional select | Uttaradi, Vyasaraja, Raghavendra, Sode Vadiraja, Udupi Ashta Mathas, Sringeri, Ramachandrapura, Swarnavalli |
| Veda / shakha | optional select | Rigveda, Yajurveda (Taittiriya/Shukla), Samaveda, Kanva |

This is a change from what we have: `ref_communities` is currently keyed by
`language_id`, which is exactly the exclusive tree both researchers warn against.

---

## Traps — do not put these in a dropdown

| Item | Why |
| --- | --- |
| **"Nambiar"** unqualified | Two unrelated communities share the name: the small Ambalavasi Nambiar (Mizhavu players) and the large Nair Nambiar of North Malabar, who are neither Brahmin nor Ambalavasi. Must be disambiguated or omitted. |
| **"Pattar"** as primary label | Encyclopedic sources treat it neutrally, but Kerala community writing repeatedly describes it as derisive. Use "Kerala Iyer (Palakkad Iyer)" and keep Pattar only as a search alias. |
| **"Golaka"** | A colonial-era slur alleging illegitimate descent, applied to Sthanikas by Thurston (1909). Never surface anywhere. |
| **Ambalavasi communities under a "Brahmin" heading** | Pushpaka, Nambeesan, Unni, Adikal, Nambidi, Theeyattunni, Chakyar, Pisharody, Warrier, Marar. Status disputed between sources, denied by mainstream scholarship (Fuller, *The Nayars Today*, 1976), and Kerala classes them OBC while Namboothiris are forward caste. Offer under a separate "Ambalavasi (temple-service communities)" heading with no Brahmin label asserted. |
| **"Namboodiripad", "Bhattathiripad"** | Titles/ranks within Namboothiri, not communities. Belong in a surname field. |
| **Bhat, Jois, Rao, Acharya, Udupa, Adiga, Cukkemane** | Surnames and honorifics, not sub-communities. |
| **"Magane", "Buddhivanta"** | An administrative subdivision term and a historical epithet respectively. Neither is a current self-identification. |
| **"Madhava"** | A name of Vishnu, not the sect. The sect is Madhwa (display) / Madhva (scholarly). Accept as a search alias, never display. |
| **"Aivathoklu"** | A village in Sulya taluk. Looks like a sibling of Aruvathokkalu; is not a community. |
| **"64 Kula"** for Aruvathokkalu | Miscount in one source. *Aruvattu* and *shashti* both mean **sixty**. |

---

## Sensitive: Sthanika Brahmin

Thurston (1909) recorded that Sthanikas "claim to be Brāhmans, though other
Brāhmans do not admit the claim", and repeated a derivation that is effectively a
slur. Modern sources and the community's own account describe them instead as
Smarta Tuluva Brahmins who held temple administration and chief-priesthood and
were dispossessed during 18th-century Shaiva–Vaishnava rivalry — with epigraphic
support (1288 CE Mallayyanahalli inscription, 120 Sthanikas administering a temple).

**Decision: list "Sthanika Brahmin" as a first-class option with no caveat or
footnote.** The contestation is colonial-era and belongs in these notes, not in
front of a family filling in a profile.

---

## Kerala / Malayalam — safe to list

Namboothiri (Namboodiri / Nambudiri) · Potti (Potty) · Embranthiri (Embrandiri) ·
Kerala Iyer (Palakkad Iyer) · Gowda Saraswat Brahmin (Konkani, Kochi) ·
Elayathu (boundary case — Thurston: "lowest of Brahmins")

Namboothiri sub-options people specify: Adhyan / Asyan / Othillathavar.
Kerala Iyer sub-sects: Vadama, Brahacharanam.

**Ambiguous:** "Moosad" covers two different things — the temple-service Muttatu,
and the Ashtavaidyan physician lineages who are Namboothiri. Needs validation.

---

## Karnataka / Tulu — safe to list

**Smarta cluster:** Hoysala Karnataka · Halenadu Karnataka (Mugooru) · Babbur Kamme ·
Ulucha Kamme · Badaganadu · Mulukanadu · Sankethi (sub: Kaushika, Bettadapura) ·
Deshastha (Rigvedi / Yajurvedi) · Karhade (Karada) · Kota · Kandavara · Panchagrama ·
Havyaka (Havika)

**Madhwa cluster:** Deshastha Madhwa · Shivalli · Koteshwara · Aruvathokkalu ·
Badaganadu Madhwa

**Sri Vaishnava:** Hebbar Iyengar · Mandyam Iyengar (both with Vadakalai / Thenkalai)

**Tulu:** Shivalli · Sthanika (sub: Subramanya, Kumbla) · Kota · Koteshwara · Kandavara

Notes: **Koteshwara (Madhwa) and Kota (Smarta) are different communities** despite
being paired in dropdowns. **Kandavara is Smarta, not Madhwa** — the only
encyclopedic source contradicts the common assumption. **Shivalli is not
exclusively Madhwa**; Shivalli Smartas exist and are a listed category elsewhere.
**"Hebbar" alone is ambiguous** — it is also a common surname; label it "Hebbar Iyengar".

**Thin evidence, needs validation:** Sirinadu (Sirnadu), Saklapuri, Aruvathokkalu
spelling (seven variants found, no two sources agree).

---

## Madhya Pradesh & Maratha-migrant communities

**Safe to list:** Jijhotia Brahmin (Bundelkhand — Chhatarpur, Sagar) · Sanadhya
Brahmin (western UP, Rajasthan, Delhi, MP) · Narmadiya / Naramdev Brahmin
(Narmada valley — Harda, Khandwa, Barwani, Dhar, Khargone) · Deshastha /
Chitpavan / Karhade (Maratha-era migration into Gwalior, Indore, Ujjain,
Bundelkhand — documented in Roberts, *The Historical Journal* 14(2), 1971) ·
Kanyakubja

**Gujarat, not MP:** Nagar Brahmin (sub-divisions Visnagara, Sathodara, Krasnora,
Chitroda, Prashnora — one of the best-sourced entries found) · Audichya Brahmin
(sub-divisions Sahasra / Tolakia). Neither has documented modern MP presence
despite being commonly assumed to.

**Hold — needs validation:** Malwi (probably a territorial qualifier on Gaur, not
a caste; also a language name) · Golapurab / Galav (one 19th-century source) ·
Ahiwasi (real, MP presence real, but Brahmin status disputed — mixed-origin
tradition recorded in MP)

**Reject:** "Chhattisgarhi Brahmin" is not a documented distinct community.
Chhattisgarh Brahmins select Kanyakubja, Sarayuparin or Utkala.

**Do not nest Jijhotia or Sanadhya under Kanyakubja.** Sources point both ways —
Sanadhya is linked to Gaur by one Wikipedia article and to Kanyakubja by another,
and many Jijhotia self-identify as a distinct endogamous caste.

---

## ⚠️ "Gaur" — the highest-risk entry, and we already have it

We currently list a bare **`Gaur`** under Hindi. That single string has at least
five referents, two of which are **not Brahmin**:

| Referent | What it is |
| --- | --- |
| **Gaur Brahmin** | The North Indian caste — Haryana, Rajasthan, western UP, MP, Delhi |
| **Gauda** | The Pancha-Gauda *category* label covering five communities — not a caste |
| **Gauḍa** | The historical region/kingdom of **Bengal**. A Bengali user typing "Gaur" means something else entirely |
| **Gauda (Odisha)** | A **pastoralist** caste. **Not Brahmin.** |
| **Gowda (Karnataka)** | A **landholding** community. **Not Brahmin.** |

Separately, **Gaud Saraswat Brahmin** (Konkan/Goa) is a different community again.

**Action: relabel our entry "Gaur Brahmin (North India)" and never autocomplete
"Gaud" to a single value.** As it stands a Karnataka Gowda or an Odia Gauda could
select it and be silently classed as a North Indian Brahmin.

---

## Pancha Gauda / Pancha Dravida

Real medieval scheme (Kalhana's *Rajatarangini*, c. 12th c.) but **the sources
disagree on membership** — the *Sahyadri-khanda*, Hemadri's 13th-c. fragment and
the Maratha-era *kaifiyats* each give different lists, and Gurjara moves between
the two halves depending on source. Usable as a top-level grouping label; the
assignment of any modern caste to one of the ten must never be auto-derived.

Note MP straddles the Vindhya line: Narmada-valley communities self-classify as
Pancha-**Dravida** despite being in MP.

## Himachal / Punjab hills — and the safety problem

**Safe-ish:** Saraswat Brahmin (the dominant branch; ~25% of Punjab Brahmins were
in what is now HP) · Kangra Brahmin (regional descriptor) · Gaddi Brahmin
(Brahmins within the Gaddi ethnic grouping — Kangra, Chamba, Una) · Dogra Brahmin
(real, but primarily J&K)

**Needs validation, single medium-quality source each:** Nagarkoti · Bhateru ·
Bhojki/Bhojak. None appears in any government list or tier-1 reference work — the
Wikipedia list of Brahmin communities has **no Himachal entry at all**.

### Officially NOT Brahmin — must never appear in a Brahmin dropdown

| Name | Actual classification |
| --- | --- |
| **Batwal** | **Scheduled Caste**, HP SC list #10 |
| **Hali** | **Scheduled Caste**, HP SC list #28 |
| **Ghirth / Ghirath / Chaudhary** | **OBC**, HP central list #19 |
| **Halbi** | A Central Indian tribal language/community. No Himachal connection whatsoever. |

### ⚠ The collision that could do real harm

**`Hali` is a Scheduled Caste. `Halbaha` is a Brahmin group.** Both derive from
ploughing, and they are one character apart. Any fuzzy match, autocomplete or
"did you mean" that bridges those two strings would assign someone the wrong caste
status — which in India touches reservation entitlement, not just etiquette.

**Rule: no fuzzy matching across community names. Exact match or explicit
selection only.**

Same shape of problem with **Bhardwaj** and **Kaundal**: both are Brahmin gotra
names *and* documented **Ghirth clan** names in Himachal. A Himachali "Bhardwaj"
is not reliably Brahmin.

### Bhat / Bhatt — litigated, do not adjudicate

"Bhat" is simultaneously a Brahmin title (Sanskrit *bhaṭṭa*, "scholar") **and**
entry #10 of the HP Central OBC list. The status has been through the HP High
Court (*Bhat Brahman Kalyan Samiti v. State of H.P.*), where the state's own
notification covered "Bhat or Bhata (whether with or without the appendage of
Brahman)". A Himachali typing "Bhatt" is most likely entering a **surname**.
**Keep Bhat/Bhatt out of the community field entirely; handle it as a surname.**

### Rank terms are not identity terms

Nagarkoti / Bhateru / Halbaha describe a **hypergamous ranking** within Kangra —
Nagarkotia took brides from the others and did not give daughters back. Halbaha
("plough-driver") is the bottom of that ladder.

**Putting that ladder in a dropdown asks users to publicly self-rank.** We should
not do that. Offer "Kangra Brahmin" or "Saraswat Brahmin" and let any sub-group be
free text.

---

## The pattern across all four regions

Every region researched turned up the same two failure modes:

1. **Communities widely assumed to be Brahmin that officially are not** — Ambalavasi
   (Kerala, OBC), Ghirth (HP, OBC), Bhat (HP, OBC), Ahiwasi (MP, disputed),
   Gauda/Gowda (Odisha and Karnataka, not Brahmin).
2. **Names that collide across caste boundaries** — Hali/Halbaha, Gaur/Gowda,
   Nambiar (Ambalavasi vs Nair), Bhardwaj (gotra vs Ghirth clan), Hebbar (Iyengar
   vs surname), koushika (Kaundinya vs Kaushika, already a live bug — see P0b).

**Design conclusion: the platform must never assert or infer caste status.** Let
people self-identify from a validated list, with free-text fallback, exact-match
only, and no status label attached to any entry. Anything else risks telling a
family they are something they are not — in a domain where that carries legal and
social weight we cannot see from here.

## Still missing

- UP/Bihar core, Bengal, Odisha, Assam — research in progress
- ~~Gotra list and the pravara question~~ — **done**, and it found four code bugs. See P0b in LAUNCH-BACKLOG.md
- Telugu and Tamil — not yet commissioned; our existing 4 and 3 entries are thin
- `ref_languages` lacks Malayalam, Bengali, Gujarati, Odia, Punjabi, Konkani, Tulu, Assamese

## Open question for the exogamy rule

Traditional practice governs marriage eligibility via **gotra and pravara**. We
store both but the automatic check uses gotra only. If pravara is also governing,
our exogamy enforcement is incomplete — which would be the most serious class of
error this product can make. Awaiting the research.

---

## Log

| Date | Event |
| --- | --- |
| 2026-08-16 | Kerala and Karnataka/Tulu research completed. North India and gotra research still running. Nothing yet validated or loaded. |
| 2026-08-16 | MP / Maratha-migrant region added. Flagged that our existing bare `Gaur` entry is ambiguous across five referents, two of them not Brahmin. |
| 2026-08-16 | Himachal added. Found SC/OBC communities commonly mistaken for Brahmin, and a one-character collision (Hali/Halbaha) between a Scheduled Caste and a Brahmin group. Concluded: no fuzzy matching on community names, ever. |
