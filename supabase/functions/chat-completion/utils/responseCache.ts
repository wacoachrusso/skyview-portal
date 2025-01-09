import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function getCachedResponse(query: string, airline?: string, workGroup?: string): Promise<string | null> {
  console.log('Checking cache for query:', query, 'airline:', airline, 'workGroup:', workGroup);
  
  const { data, error } = await supabase
    .from('cached_responses')
    .select('response, access_count')
    .textSearch('query', query)
    .eq('airline', airline)
    .eq('work_group', workGroup)
    .single();

  if (error) {
    console.log('No cached response found or error:', error.message);
    return null;
  }

  if (data) {
    console.log('Found cached response, updating access count');
    
    // Update access count and last accessed timestamp
    await supabase
      .from('cached_responses')
      .update({
        access_count: data.access_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .textSearch('query', query)
      .eq('airline', airline)
      .eq('work_group', workGroup);
    
    return data.response;
  }

  return null;
}

export async function cacheResponse(query: string, response: string, airline?: string, workGroup?: string): Promise<void> {
  console.log('Caching response for query:', query, 'airline:', airline, 'workGroup:', workGroup);
  
  try {
    await supabase
      .from('cached_responses')
      .insert([
        {
          query,
          response,
          airline,
          work_group: workGroup,
          access_count: 1
        }
      ]);
    console.log('Response cached successfully');
  } catch (error) {
    console.error('Error caching response:', error);
  }
}