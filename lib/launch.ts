import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase-admin";

export type LaunchRegistrationInput = {
  full_name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  /** Collected later at onboarding — optional at pre-registration. */
  profession?: string;
  location?: string;
  email: string;
  phone: string;
  source?: string;
};

export const FOUNDING_MEMBER_TARGET = 1000;

export const getLaunchRegistrationCount = cache(async () => {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("launch_registrations")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(
        "Launch registration count error:",
        error.message,
        `[code: ${error.code ?? "?"}]`,
        error.details ?? "",
      );
      return null;
    }

    return count ?? 0;
  } catch (error) {
    console.error(
      "Launch registration count unavailable:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
});

export async function createLaunchRegistration(input: LaunchRegistrationInput) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("launch_registrations")
    .insert({
      ...input,
      // profession/location are onboarding-stage; keep the NOT NULL columns satisfied.
      profession: input.profession ?? "",
      location: input.location ?? "",
      source: input.source || "launch-homepage",
    })
    .select("id, full_name, email, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
