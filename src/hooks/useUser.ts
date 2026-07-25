"use client";

import type { User } from "@supabase/supabase-js";

// Auth är tillfälligt inaktiverat. Returnerar alltid gäst-läge.
// TODO: ersätt med Firebase Auth
export function useUser() {
  return { user: null as User | null, loading: false };
}
