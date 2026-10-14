import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmwfufzdyrmfjaejmvbs.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtd2Z1ZnpkeXJtZmphZWptdmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1OTYxMTUsImV4cCI6MjEwNzE3MjExNX0.63kyvUp51skzsadlNYtoqEyxSsPkEYKr7D5sOxyXmRQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)