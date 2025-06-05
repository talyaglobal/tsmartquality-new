import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Client with anonymous key for public operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service key for privileged operations (if available)
export const supabaseAdmin: SupabaseClient = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : supabase;

export default supabase;