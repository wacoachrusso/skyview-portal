import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const getCachedResponse = async (query: string) => {
  console.log('Checking cache for query:', query);
  const { data, error } = await supabase
    .from('cached_responses')
    .select('response')
    .eq('query', query)
    .single();

  if (error) {
    console.error('Cache lookup error:', error);
    return null;
  }

  if (data) {
    console.log('Cache hit!');
    // Update access count and timestamp
    await supabase
      .from('cached_responses')
      .update({
        access_count: supabase.sql`access_count + 1`,
        last_accessed_at: new Date().toISOString()
      })
      .eq('query', query);
  }

  return data?.response || null;
};

export const cacheResponse = async (query: string, response: string) => {
  console.log('Caching response for query:', query);
  const { error } = await supabase
    .from('cached_responses')
    .insert([{ query, response }])
    .single();

  if (error) {
    console.error('Cache storage error:', error);
  }
};