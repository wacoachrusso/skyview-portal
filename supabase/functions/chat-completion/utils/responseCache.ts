
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withRetry } from '../utils/retryUtils.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function getCachedResponse(query: string): Promise<string | null> {
  console.log('Checking cache for query:', query);
  
  try {
    const { data, error } = await withRetry(() => 
      supabase
        .from('cached_responses')
        .select('response, access_count')
        .textSearch('query', query)
        .single(),
      {
        maxRetries: 2,
        initialDelay: 500
      }
    );

    if (error) {
      console.error('Error checking cache:', error);
      return null;
    }

    if (data) {
      console.log('Cache hit! Updating access count');
      // Update access count and last accessed timestamp
      await supabase
        .from('cached_responses')
        .update({ 
          access_count: data.access_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .textSearch('query', query);
      
      return data.response;
    }

    return null;
  } catch (error) {
    console.error('Cache check failed:', error);
    return null;
  }
}

export async function cacheResponse(query: string, response: string): Promise<void> {
  console.log('Caching response for query:', query);
  
  try {
    await withRetry(() => 
      supabase
        .from('cached_responses')
        .insert([
          {
            query,
            response,
            access_count: 1
          }
        ]),
      {
        maxRetries: 2,
        initialDelay: 500
      }
    );
    console.log('Response cached successfully');
  } catch (error) {
    console.error('Error caching response:', error);
    // Non-blocking - just log the error
  }
}
