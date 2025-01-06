import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function getCachedResponse(query: string): Promise<string | null> {
  console.log('Checking cache for query:', query);
  
  const { data, error } = await supabase
    .from('cached_responses')
    .select('response, access_count')
    .textSearch('query', query)
    .single();

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
}

export async function cacheResponse(query: string, response: string): Promise<void> {
  console.log('Caching response for query:', query);
  
  try {
    await supabase
      .from('cached_responses')
      .insert([
        {
          query,
          response,
          access_count: 1
        }
      ]);
    console.log('Response cached successfully');
  } catch (error) {
    console.error('Error caching response:', error);
  }
}