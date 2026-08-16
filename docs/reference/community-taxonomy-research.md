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

## Uttar Pradesh, and the answer to "cover North Indian categories"

**Most of what a North Indian user will type is a surname, not a community.**

Pandey, Mishra, Tiwari, Tripathi, Dubey, Dwivedi, Trivedi, Shukla, Chaturvedi,
Upadhyay and Malviya are **Vedic scholarly titles that hardened into hereditary
surnames**, and they cut straight across communities. *Tripathi* appears among
both Saryupareen and Kanyakubja; *Mishra* among Maithil **and** UP lines. The
surname carries no reliable community information.

Two pairs are the same word, so listing both double-counts one title:

- **Tiwari = Tripathi** -- both from *tripathin*, "knower of three Vedas" (CDIAL 6032)
- **Chaube = Chaturvedi** -- both from *caturveda*, "four Vedas" (CDIAL 4625)

**Ship (UP):** Kanyakubja - Saryupareen *(nests **under** Kanyakubja, not a
sibling)* - Sanadhya - Gaur Brahmin - Ahiwasi - Chaube *(Mathura/Braj; the
regional qualifier is required, since unqualified it collects everyone holding
the surname)* - Sakaldwipiya/Maga

**Qualifier mandatory:** "Gangaputra Brahmin (UP)". Bare "Gangaputra" is also a
Telugu fisherman caste and a separate Bihar caste. Its alternate name **Ghatiya**
is both a low-prestige occupational label and an everyday Hindi insult ("cheap,
third-rate"). Never surface it.

**Exclude:**

| | |
| --- | --- |
| **Bhargava** | A gotra, *and* the name the Dhusar (a **Vaishya** mercantile community) adopted in a 19th-c. status claim. Contested. Support as gotra and surname, never as a Brahmin community. |
| **Bairagi** | A Vaishnava ascetic order. **UP Central OBC list, entry 33.** |
| **Belwar** | A **Banjara** subcaste, miscategorised upstream as Brahmin. |
| **Golapurab** | One unreliable 19th-c. source, and collides with **Golapurva**, a Digambar **Jain** community. |
| **Radha caste** | No source asserts Brahmin status. |

### Kattaha / Mahabrahmin -- omit from v1

North India's traditional **funeral priests**. Citing Parry's *Death in Banaras*:
"their status as Brahmin is barely recognized by other Brahmin groupings." They
live in separate residential areas within villages.

**"Mahabrahmin" is derisive** -- an ironic honorific applied precisely because
they absorb the pollution of death. Selecting it in a matrimony dropdown is
disclosure of a stigmatised identity into a context where discrimination is the
norm. If we ever serve this community it must be under their own preferred
self-designation, obtained by asking them.

---

## Uttarakhand (Kumaon and Garhwal)

**Ship (5):** Kumaoni Brahmin - Garhwali Brahmin - Sarola *(Garhwal)* - Gangari
*(Garhwal)* - Dimri *(Garhwal, the Badrinath mahaprasad lineage)*. Present the
last three as optional refinements of Garhwali, alphabetised, unranked.

**Surnames, not communities** -- proven by documented **intermarriage**, the
definitive test of a caste boundary. Atkinson (1882) records Pants, Pandes,
Joshis, Tiwaris, Upadhyayas and Pathaks all marrying one another. So Pant, Joshi,
Pandey, Tewari, Upreti, Pathak, Bhatt, Nautiyal, Raturi, Khanduri, Thapliyal,
Semwal, Bahuguna, Uniyal, Dobhal and Dangwal all belong in the surname field.

### Block these strings entirely -- not even as search synonyms

**Khasa - Khasiya - Khasia - Khas Brahmin - Pitali - Hali - Nan-dhoti**

Sanwal (1976), quoted by Pande: these titles "**are avoided by members of the
caste they are intended for**", and British rule ended "the wearing of a brass
bracelet, a symbol of lowly servile status." *Pitali* means brass -- the enforced
badge. *Hali* means ploughman/serf. A second source: "In Kumaon, the derogatory
word Khasia is popular for them."

The category is also **defunct** (Khasa and Thuljat merged into one Brahmin
identity by ~1920) and it named the *majority* -- 22% of Kumaon's population in
1872 against 3% Thuljat. Shipping it would invite most Kumaoni Brahmins to
re-sort themselves into a category their great-grandparents worked to escape.

**Also do not ship:** Thuljat, Asal-jat, Bhalbaman, Chauthani, Chauthoki,
Pachbiri. Rank labels, not communities. *Thuljat* covered Brahmins **and**
Rajputs and was a claim about **land tenure** -- Sanwal found a Thuljat who
became a tenant "lost his Thuljaat status."

**Sarola vs Gangari is a live rank hierarchy.** Both are genuine self-ascribed
identities and both can be offered, but with **no ordering and no annotation**.
Pati Ram -- the source Wikipedia leans on -- says the Sarola superiority was not
original but conferred later by royal decree.

**A pleasing correction:** the **Rawal of Badrinath is a Nambudiri from Kerala**,
and the Kedarnath Rawal a Jangam from Karnataka. Neither is an Uttarakhand
community; a Rawal-lineage user belongs under Nambudiri.

---

## Rajasthan, Punjab/Haryana, Gujarat, Kashmir, Bengal, Assam

Condensed; the full pass is in the agent transcript.

**Rajasthan:** Dadhich (best-sourced; patron goddess Dadhimati; has *khampas*
alongside gotras) - Gaur - **Gujar Gaur** *(a real Brahmin community; "Gurjar"
here means residence in Gurjaradesa, not Gujjar descent -- never fuzzy-match to
the Gujjar OBC caste)* - Pushkarna - Shrimali - Sikhwal - Paliwal - Pareek
*(canonical spelling; do **not** alias Parikh/Parekh into it -- those are
Gujarati Bania and Jain surnames)*.

**Punjab/Haryana/Delhi:** Gaur *(the largest Brahmin community of Haryana and
Delhi)* - Punjabi Saraswat - **Mohyal** *(seven clans: Bali, Bhimwal, Chhibber,
Datt, Lau, Mohan, Vaid; well-sourced and **not** contested, contrary to my
assumption. The separate **Hussaini Brahmin** Karbala narrative is oral tradition
only -- do not collapse the two claims)*.

**Kashmir:** Kashmiri Pandit. **The split is three-way, not two** -- Gor/Bachabat
(priestly), Jyotishi (astrologers), Karkun (administrative). And the one sub-sect
distinction in this entire body of research with a **real matching consequence**
rather than a prestige one: *"All three subcastes interdine and interteach, but
only the Jotish and Karkun subcastes intermarry."* The priestly Gor line is
endogamously separate. That one is worth surfacing.

Kashmiri **krams** -- Kaul, Bhat, Razdan, Dhar, Raina, Haksar, Munshi, Sapru,
Pandit, Zutshi -- are surnames within one community. Splitting them would
fragment an already small, diaspora-scattered population into unmatchable
buckets. Note **Bhat** is also borne by Kashmiri Muslims.

**Gujarat:** Audichya *(largest; Sahasra and Tolakiya are endogamous)* - Nagar
*(Vadnagara plus five branches)* - Modh - Khedaval - Sachora - Girnara - Bardai -
Sompura - Mewada - Aboti. **Pushtimarg is a sampradaya that cuts across
subcastes** -- model sect as a separate field; do not infer it from community.

**Bengal:** Rarhi - Barendra - Vaidik - Saptashati - Madhyashreni - Shakadwipi.
**Kulin surnames are not communities** -- Banerjee/Bandyopadhyay,
Chatterjee/Chattopadhyay, Mukherjee/Mukhopadhyay, Ganguly/Gangopadhyay,
Bhattacharya, Chakraborty. Both Sanskritised and anglicised forms map to the
surname field. **Baidya/Vaidya is not Brahmin** despite adjacency.

**Assam:** Assamese Brahmin. **Kalita is confirmed not Brahmin** (self-claims
Kshatriya). **Ganak** is OBC, but *only in Cachar, Karimganj and Hailakandi* --
blanket "Ganak = OBC" is wrong for the Brahmaputra valley.

### More OBC communities marketed as Brahmin

- **Dakaut** -- Haryana Central OBC list, Sl. 21
- **Jangid / Jangra Brahman** -- Haryana Central OBC list, Sl. 38, grouped with
  **carpenter/artisan castes** (Khati, Ramgarhia, Suthar, Dhiman, Tarkhan,
  Barhai). Do not accept "Vishwakarma Brahmin" or "Jangid Brahmin".

### Four communities needing neutral top-level treatment

**Bhumihar, Tyagi, Rajpurohit, Anavil.** Each has a genuine, live dispute about
Brahmin status -- with scholarship, caste associations and in some cases state
classification on different sides. Nesting them under Brahmin takes a side;
omitting them takes the other. List each as its own top-level entry and let
people self-identify.

Their older names -- **Babhan** (Bhumihar) and **Taga** (Tyagi) -- are names the
communities actively moved away from. Search aliases at most, never display
labels.

### Bare toponyms that need a "Brahmin" suffix

**Khandelwal** defaults to **Vaishya/Bania and Jain**, neither Brahmin -- the UP
OBC list itself says "Khandelwal who are sub-castes of Baniya". Also **Shrimali**
(Vanik, Jain, Soni), **Modh** (Vania, and Modh Ghanchi/Teli who are OBC),
**Nagar** (Vania; also an OBC caste in Bihar and West Bengal), **Paliwal**,
**Sompura** (also a mason community), **Dogra**, **Saraswat**.

---

## Bengal, Odisha, Assam — and a schema finding

### Bengal is two axes, not one

This is the biggest modelling point in the whole body of research:

- **Axis A, endogamous territorial division:** Rarhi, Varendra, Vaidik,
  Saptashati, Madhyashreni, Sakadwipi
- **Axis B, Kulinism rank:** Kulin / Shrotriya / Vangaja *(for Varendra the
  second rank is **Kap**, not Shrotriya)*

A person is **both** -- "Rarhi Kulin", "Varendra Shrotriya". **Offering "Kulin
Brahmin" as a sibling option next to "Rarhi Brahmin" is simply wrong**, and it is
the shape a naive flat dropdown would take. Kulin rank belongs in a separate
optional field, and must never be required: many people do not know theirs.

Kulinism was also the mechanism behind **Kulin polygamy**, which Vidyasagar
campaigned against. Historicity is disputed -- the Adisura legend is described as
"myth or folklore, lacking historical authenticity". Do not surface any of that
history in the UI.

**Vaidik splits into Paschatya and Dakshinatya, which do not intermarry.** If we
list Vaidik at all, list both halves.

### Odisha

**Ship:** Utkala Brahmin *(umbrella)* - Sasani *(aliases: Shasani, Sasan,
Danua)* - Halua - Sakaldwipi.

**Source-quality warning:** almost all online "Utkala Brahmin classification"
content descends from **one self-published e-book**, mirrored across Familypedia,
EverybodyWiki, Grokipedia and Scribd -- circular citation that reads as
corroboration. The live Wikipedia article has no subdivision list at all.

**Halua and Jhadua are not a matched pair** and must not be offered as a binary.
Halua is occupational-descent (from *hala*, plough), Jhadua is
ecological/regional. Halua carries documented stigma -- the peer-reviewed source
records that they "identify as half brahmin or as not pure brahmin" and "straddle
between Brahmins and non-Brahmins", which Halua people themselves contest.
**Include it** (it is a real self-identification with a large population, and
omitting it erases people) but never ranked, never with purity language, and
never *suggested* -- selectable only. **Jhadua** rests entirely on the
self-published e-book; hold it until validated.

**Daitapati are not Brahmin** -- the Jagannath temple servitors, endogamous
within their own community. During Anavasara the Daitas take over worship *from*
the Brahmin priests; the sources set the two in opposition. List separately,
and **unqualified by any origin claim** -- one scholar argues the tribal-descent
framing is itself a colonial construction.

**Puri sevak roles are hereditary offices, not communities.** The Chhatisa Nijoga
spans ~119 categories drawn from many castes.

### Assam

**Ship:** Assamese Brahmin *(aliases: Asomiya, Axomiya, Bamun, Kamrupi)* -
Bengali Brahmin (Barak Valley/Tripura) - Manipuri Brahmin - **Daivagya Brahmin
(Ganak / Surjyo Bipra)**, with neutral disclosure that the status is
self-asserted and contested.

Use **Daivagya Brahmin**, not "Ganak" -- Ganak is the outsider/administrative
label; Daivagya Brahmin and Surjyo Bipra are the community's own.

**Kalita is not Brahmin** (self-claims Kshatriya). **Nath/Jogi is not Brahmin**,
and **"Jugi" is felt to be derisive** -- display "Nath". Satra offices
(Goswami, Adhikari, Bhagawati, Pathak) are **offices, not lineages** -- "the
satradhikar may not always be of high birth", and Satra leadership has included
Kayastha and Candal figures. A Goswami profile must not be auto-classified as
Brahmin.

**Assamese surnames are unusually poor caste predictors** because so many are
Ahom-state or Satra *offices*: Bordoloi is used by Brahmins, Kalitas, Tiwas and
Chutias alike; Baruah, Borthakur and Changkakoti are Ahom-era titles.

### Agradani -- do not ship

Bengali funeral Brahmins, "acceptor of first gifts". Every source that describes
them does so in the vocabulary of degradation -- "despised", "considered fallen".
There is no evidence of it working as a positive contemporary self-identification.
Accept it silently if typed in free text; never suggest it. Same treatment as
Kattaha/Mahabrahmin in the North.

---

## A correction to my own framing

**Being on an OBC list does not mean a community is not Brahmin.**

I leaned on that inference repeatedly while writing up the earlier regions --
Ambalavasi in Kerala, Ghirth and Bhat in Himachal, Bairagi in UP. The East India
research supplies the counter-example that breaks it: **Manipuri Brahmins are
themselves OBC in Assam** (Central List entry 13, "Manipuri, including Manipuri
Brahmin and Manipuri Muslim").

An OBC listing is a finding of **social and educational backwardness**. It is not
a ruling on varna, and the two are decided by different authorities for different
purposes. Where I cited an OBC listing above, read it as *"the state has assessed
this community as backward"* -- relevant context, and a strong signal that a
community's status is contested enough to be worth care, but **not** proof of
anything about Brahmin identity.

The communities I flagged as genuinely not Brahmin on **other** grounds --
Batwal and Hali (Scheduled Castes), Kalita, Baidya, Kayastha, Daitapati, Belwar
(Banjara), Halbi (Central Indian tribal) -- stand on that separate evidence, not
on OBC listings.

This makes the central design conclusion stronger, not weaker: **we are not
equipped to adjudicate caste status, and we should not try.**

---

## The pattern across every region

Every single region researched turned up the same two failure modes:

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

### Three errors this research found in our own files -- all verified, all fixed

1. `utils/community-data.ts:176` listed **`'chitragupta'` as an alias for
   Chitpavan**. Chitragupta is the divine progenitor of the **Kayastha** caste.
   A Kayastha typing their own tradition resolved to a Brahmin community.
2. `utils/community-data.ts:133` described Gaur as "From Gaud (Bengal/UP) region
   -- highly respected lineage". The Bengal derivation is the *disputed* folk
   etymology, and "highly respected lineage" ranks a community in copy the user
   reads.
3. `docs/reference/VEDIC_HIERARCHY_GUIDE.md:12` listed Pancha Gauda as **six**
   divisions, dropped **Utkala** entirely, and added Saryupareen (a sub-caste
   *of* Kanyakubja) and Kashmiri Pandit (who are Saraswat).

### And ten colliding alt-names, found by scanning our own data

`vaidiki` `vaidika` `smartha` `havyaka` `hoysala karnataka` `saraswat`
`mulakanadu` `koushika` `shandilya` `shaunaka`

`findCommunity` and `findGothra` both use `.find()`, which returns the **first**
match. So every one of these silently resolves to whichever entry was declared
earlier -- `smartha` to Tamil Iyer rather than Kannada Smartha, `saraswat` to the
Hindi entry rather than Goud Saraswat. This is the same defect class as the
`koushika` gotra bug already logged as P0b, and it needs the same fix: resolve
within the selected language, and make a genuinely ambiguous string ask rather
than guess.

| 2026-08-16 | UP, Uttarakhand and the wider North/East pass added. UP's headline: North Indian users mostly type surnames, not communities. Uttarakhand contributed a block-list of genuinely derisive terms. The research also caught three factual errors in our own data files and ten colliding alt-names. |
| 2026-08-16 | Bengal/Odisha/Assam added, completing the sweep. Bengal turned out to be two orthogonal axes (territorial division x Kulin rank), which a flat dropdown would model wrongly. Also corrected my own repeated inference that an OBC listing implies non-Brahmin status -- Manipuri Brahmins are OBC in Assam. |
