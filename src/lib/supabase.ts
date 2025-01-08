import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants';

const NEXT_PUBLIC_SUPABASE_URL = Constants.expoConfig.extra.supabaseUrl;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;



export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)