import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      async getAll() {
        return (await cookies()).getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const store = await cookies();
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        } catch {
          // ignore if called from a Server Component
        }
      },
    },
  });
};
