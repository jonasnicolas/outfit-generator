import { supabase } from './supabase';

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  if (!supabase) {
    return {
      success: false,
      message:
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.',
    };
  }

  try {
    // Test 1: Basic connection
    const { error } = await supabase
      .from('clothing_items')
      .select('count')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase database',
        details: error
      };
    }

    // Test 2: Storage connection
    const { error: storageError } = await supabase.storage
      .from('clothing-images')
      .list('', { limit: 1 });

    if (storageError) {
      return {
        success: false,
        message: 'Failed to connect to Supabase storage',
        details: storageError
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful!',
      details: {
        database: 'Connected',
        storage: 'Connected',
        tables: 'Ready'
      }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      details: error
    };
  }
}

// Test function you can call from browser console
(window as any).testSupabase = testSupabaseConnection;
