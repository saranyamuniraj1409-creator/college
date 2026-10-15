import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Anon Key from environment variables or localStorage (for user testing)
const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('campus_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('campus_supabase_anon_key') : null;

  const url = storedUrl || envUrl || '';
  const key = storedKey || envKey || '';

  return { url: url.trim(), key: key.trim() };
};

export const { url: supabaseUrl, key: supabaseAnonKey } = getCredentials();

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key.length > 20
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  const { url, key } = getCredentials();
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return clientInstance;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const updateSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('campus_supabase_url', url.trim());
    localStorage.setItem('campus_supabase_anon_key', key.trim());
    clientInstance = null; // reset to reinitialize
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('campus_supabase_url');
    localStorage.removeItem('campus_supabase_anon_key');
    clientInstance = null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url || !key) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return { success: false, message: 'Invalid Supabase URL format. It should look like https://your-project-id.supabase.co' };
    }
    const testClient = createClient(url, key);
    // Simple lightweight ping
    const { error } = await testClient.from('departments').select('count', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist yet, connection is still valid!
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connection successful! (Tables not yet created. Run supabase-schema.sql in Supabase SQL editor).' 
        };
      }
      return { success: false, message: `Supabase returned: ${error.message}` };
    }
    return { success: true, message: 'Connected successfully to your Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed to Supabase.' };
  }
};
