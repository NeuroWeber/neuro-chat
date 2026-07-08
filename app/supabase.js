import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ioyxaxuksriryiqkyoqo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveXhheHVrc3JpcnlpcWt5b3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzY4MjksImV4cCI6MjA5NzkxMjgyOX0.Su3e0XAiLNaAgANZLOoqtKq-l5Ec0ek0NtqDBQ5moaY'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)