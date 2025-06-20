import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE!;
//const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON!;

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export { supabase }