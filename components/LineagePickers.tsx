"use client";

import { useMemo, useState } from "react";

import {
  GOTHRAS,
  LANGUAGES,
  getCommunitiesForLanguage,
  getSubCommunitiesForCommunity,
  resolveCommunity,
} from "@/utils/community-data";
import { NAKSHATRAS } from "@/utils/vedic-data";

/**
 * Pickers for Gothra and community.
 *
 * Both fields were free-text inputs with a placeholder ("e.g. Kashyap"), which
 * is how the profile table came to hold a dozen spellings of one lineage. Gothra
 * decides whether two families may be introduced at all, so a typo there is not
 * a cosmetic problem — it is a wrong answer to the only question this platform
 * promises to get right.
 *
 * The community picker narrows in steps rather than offering one long list. The
 * research behind it turned up ~60 defensible communities and growing, which is
 * unusable flat on a phone; more to the point, scanning a long list of caste
 * names looking for yourself is an uncomfortable thing to ask of a family.
 * Asking which language is spoken at home is a gentler opening that happens to
 * cut the list to a handful — and it also resolves every name collision in the
 * data, since "Smartha" and "Saraswat" each mean different communities in
 * different traditions.
 */

const SELECT_CLASS =
  "w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 " +
  "focus:border-haldi-500 outline-none transition-colors";

const LABEL_CLASS =
  "block text-[10px] uppercase tracking-widest text-stone-500 mb-1.5";

/** Sentinels. Prefixed so they can never collide with a real community name. */
const OTHER = "__other__";
const UNSURE = "__unsure__";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function GothraPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const sorted = useMemo(
    () => [...GOTHRAS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  return (
    <Field label="Gothra">
      <select
        name="gothra"
        value={value || ""}
        onChange={(e) => onChange(e.target.value === UNSURE ? "" : e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Select…</option>
        {sorted.map((g) => (
          <option key={g.id} value={g.name}>
            {g.name}
          </option>
        ))}
        {/* Not knowing is common and completely ordinary. Forcing a guess here
            would put invented data into the exogamy check, which is worse than
            an empty field — an empty one is at least reported as unverified. */}
        <option value={UNSURE}>I&apos;m not sure</option>
      </select>
      <p className="mt-1 text-[9px] leading-relaxed text-stone-600">
        Used to honour Gothra exogamy. If you are unsure, leave it — we will not guess.
      </p>
    </Field>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nakshatra was free text too. It is the basis of the whole Bhrugu Match
 * calculation — Tara and Nadi both read from it — so a misspelling silently
 * produces a compatibility score computed from nothing.
 *
 * Listed in the traditional order rather than alphabetically: that is the order
 * families know them in, and it is how they appear on a panchangam.
 */
export function NakshatraPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <Field label="Nakshatra">
      <select
        name="nakshatra"
        value={value || ""}
        onChange={(e) => onChange(e.target.value === UNSURE ? "" : e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Select…</option>
        {NAKSHATRAS.map((n) => (
          <option key={n.id} value={n.name}>
            {n.id}. {n.name}
          </option>
        ))}
        <option value={UNSURE}>I&apos;m not sure</option>
      </select>
    </Field>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function CommunityPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  /**
   * The stored value is a community name, so on load we work backwards to the
   * language that contains it. Where the name is ambiguous we leave the language
   * unset rather than pick one — the member can say which, and that is the whole
   * reason this step exists.
   */
  const initialLanguageId = useMemo(() => {
    if (!value) return "";
    const result = resolveCommunity(value);
    return result.status === "resolved" ? String(result.match.languageId) : "";
  }, [value]);

  const [languageId, setLanguageId] = useState<string>(initialLanguageId);
  const [freeText, setFreeText] = useState<string>(() => {
    if (!value) return "";
    return resolveCommunity(value).status === "resolved" ? "" : value;
  });

  const communities = useMemo(
    () => (languageId ? getCommunitiesForLanguage(Number(languageId)) : []),
    [languageId],
  );

  const selected = useMemo(() => {
    if (!value || !languageId) return "";
    const result = resolveCommunity(value, { languageId: Number(languageId) });
    return result.status === "resolved" ? result.match.name : freeText ? OTHER : "";
  }, [value, languageId, freeText]);

  const subCommunities = useMemo(() => {
    if (!selected || selected === OTHER) return [];
    const result = resolveCommunity(selected, { languageId: Number(languageId) });
    return result.status === "resolved"
      ? getSubCommunitiesForCommunity(result.match.id)
      : [];
  }, [selected, languageId]);

  function handleLanguage(next: string) {
    setLanguageId(next);
    setFreeText("");
    onChange("");
  }

  function handleCommunity(next: string) {
    if (next === OTHER) {
      onChange(freeText);
      setFreeText((current) => current || "");
      return;
    }
    if (next === UNSURE || next === "") {
      setFreeText("");
      onChange("");
      return;
    }
    setFreeText("");
    onChange(next);
  }

  return (
    <div className="space-y-2.5">
      <Field label="Language spoken at home">
        <select
          value={languageId}
          onChange={(e) => handleLanguage(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Select…</option>
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Several languages have no validated communities yet. Saying so is
          better than an apparently broken dropdown — the family can still tell
          us in their own words, and that free text is what will eventually
          become the validated list. */}
      {languageId && communities.length === 0 && (
        <p className="text-[10px] leading-relaxed text-stone-500">
          We have not finished validating communities for this language yet. Please type yours
          below — we would rather record it in your words than guess.
        </p>
      )}

      {languageId && (
        <Field label="Community">
          <select
            value={freeText ? OTHER : selected}
            onChange={(e) => handleCommunity(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Select…</option>
            {[...communities]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            {/* A fixed list will always miss real self-identifications, and the
                research was explicit that we should not ship entries we cannot
                validate. This is where those belong until they are validated. */}
            <option value={OTHER}>Other — let me type it</option>
            <option value={UNSURE}>Prefer not to say</option>
          </select>
        </Field>
      )}

      {languageId && freeText !== "" && (
        <input
          type="text"
          value={freeText}
          autoFocus
          placeholder="Your community, in your own words"
          onChange={(e) => {
            setFreeText(e.target.value);
            onChange(e.target.value);
          }}
          className={SELECT_CLASS}
        />
      )}

      {subCommunities.length > 0 && (
        <Field label="Sub-community (optional)">
          <select
            name="sub_community_detail"
            defaultValue=""
            className={SELECT_CLASS}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
          >
            <option value="">Not specified</option>
            {[...subCommunities]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
          </select>
        </Field>
      )}
    </div>
  );
}
