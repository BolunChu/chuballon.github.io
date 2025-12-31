import { createClient } from '@supabase/supabase-js'

// Use placeholders if env vars are missing to prevent build-time crashes (Next.js Static Export)
// The actual values will be needed at runtime in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
