import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@env';

export const API_CONFIG = {
  SUPABASE_URL: SUPABASE_URL || 'https://hfbyctqhvfgudujgdgqp.supabase.co',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY || '',
};

if (!API_CONFIG.SUPABASE_URL || !API_CONFIG.SUPABASE_ANON_KEY) {
  console.warn('⚠️ ATTENTION: Les clés API Supabase ne sont pas configurées dans .env');
}