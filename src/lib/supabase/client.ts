import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use default configuration - @supabase/ssr handles cookies automatically
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
