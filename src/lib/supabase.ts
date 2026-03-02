// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://paexkxzjjkdqweipfhqq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DFcoW2xf1SHxXvlmLEcMkA_HUBH4uhq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const ADMIN_EMAIL = 'bao@gmail.com';
