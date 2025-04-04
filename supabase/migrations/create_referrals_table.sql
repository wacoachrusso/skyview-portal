
-- This migration ensures the referrals table exists with the correct structure
-- Only run if table doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'referrals') THEN
    CREATE TABLE public.referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id UUID NOT NULL REFERENCES auth.users(id),
      referral_code TEXT NOT NULL,
      referee_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reward_claimed BOOLEAN DEFAULT FALSE,
      referee_paid_month BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP WITH TIME ZONE,
      reward_eligible_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Create index on referral_code for faster lookups
    CREATE INDEX referrals_code_idx ON public.referrals(referral_code);
    
    -- Create index on referrer_id for faster lookups
    CREATE INDEX referrals_referrer_idx ON public.referrals(referrer_id);
    
    -- Enable Row Level Security
    ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow users to see only their own referrals
    CREATE POLICY "Users can view their own referrals" 
      ON public.referrals 
      FOR SELECT 
      USING (auth.uid() = referrer_id);
      
    -- Create policy to allow users to insert their own referrals
    CREATE POLICY "Users can create their own referrals" 
      ON public.referrals 
      FOR INSERT 
      WITH CHECK (auth.uid() = referrer_id);
  END IF;
END
$$;
