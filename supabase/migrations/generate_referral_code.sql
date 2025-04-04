
-- This function generates a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar looking characters like I, O, 1, 0
  result TEXT := '';
  i INT;
  random_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate a random 8-character code
  FOR i IN 1..8 LOOP
    result := result || substring(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  random_code := 'SKY' || result; -- Prefix with SKY
  
  -- Check if code already exists in the referrals table
  SELECT EXISTS(
    SELECT 1 FROM referrals WHERE referral_code = random_code
  ) INTO code_exists;
  
  -- If code exists, recursively generate a new one
  IF code_exists THEN
    RETURN generate_referral_code();
  END IF;
  
  RETURN random_code;
END;
$$;
