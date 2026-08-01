import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchEstatesTool from "./tools/search-estates";
import searchListingsTool from "./tools/search-listings";
import getMyProfileTool from "./tools/get-my-profile";
import listMyListingsTool from "./tools/list-my-listings";
import listMyNotificationsTool from "./tools/list-my-notifications";
import markNotificationReadTool from "./tools/mark-notification-read";

// Must be the direct Supabase host, built from the project ref (Vite inlines
// this literal at build time, so it stays import-safe).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bridgefort",
  title: "bridgefort",
  version: "0.1.0",
  instructions:
    "Tools for Bridgefort Homes — Nigerian real estate, land banking and realtor platform. Use `search_estates` for land estates, `search_listings` for residential/commercial listings, and the `my_*` tools for the signed-in user's profile, listings and notifications.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchEstatesTool,
    searchListingsTool,
    getMyProfileTool,
    listMyListingsTool,
    listMyNotificationsTool,
    markNotificationReadTool,
  ],
});
