// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gowuwfesuxrmqzcbstdjk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Truncated for brevity

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
