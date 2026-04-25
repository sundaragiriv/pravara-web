import type { DashboardFilters } from "@/types";

export type DashboardTab = "explorer" | "requests" | "connections" | "shortlist";

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  minAge: 21,
  maxAge: 40,
  location: "",
  community: "",
  searchTerm: "",
  diet: [],
  visa: "",
  minHeight: "",
  maxHeight: "",
  gothra: "",
};
