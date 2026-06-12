import { supabase } from './supabase';

export async function checkDataMismatch() {
  console.log('=== CHECKING DATA MISMATCH ===');

  if (!supabase) {
    console.warn('Supabase is not configured; nothing to check.');
    return;
  }

  try {
    // Check database records
    const { data: dbData, error: dbError } = await supabase
      .from('clothing_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return;
    }
    
    console.log('Database records:', dbData?.length || 0);
    console.log('Database items:', dbData);
    
    // Check storage files
    const { data: storageData, error: storageError } = await supabase.storage
      .from('clothing-images')
      .list('', { limit: 100 });
    
    if (storageError) {
      console.error('Storage error:', storageError);
      return;
    }
    
    console.log('Storage files:', storageData?.length || 0);
    console.log('Storage items:', storageData);
    
    // Check for mismatches
    if (dbData && storageData) {
      const dbImageUrls = dbData.map(item => {
        // Extract filename from URL
        const urlParts = item.image_url.split('/');
        return urlParts[urlParts.length - 1];
      });
      
      const storageFilenames = storageData.map(file => file.name);
      
      console.log('Database filenames:', dbImageUrls);
      console.log('Storage filenames:', storageFilenames);
      
      // Find orphaned database records (in DB but not in storage)
      const orphanedDb = dbImageUrls.filter(dbFile => !storageFilenames.includes(dbFile));
      console.log('Orphaned database records (no file in storage):', orphanedDb);
      
      // Find orphaned storage files (in storage but not in DB)
      const orphanedStorage = storageFilenames.filter(storageFile => !dbImageUrls.includes(storageFile));
      console.log('Orphaned storage files (no DB record):', orphanedStorage);
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

// Make it available in browser console
(window as any).checkDataMismatch = checkDataMismatch;
