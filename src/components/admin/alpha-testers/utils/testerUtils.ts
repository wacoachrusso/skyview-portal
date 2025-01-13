import { supabase } from "@/integrations/supabase/client";

interface CreateTesterData {
  email: string;
  fullName: string;
  password: string;
  userId: string;
  isPromoter: boolean;
}

export const createAlphaTester = async ({
  email,
  fullName,
  password,
  userId,
  isPromoter
}: CreateTesterData) => {
  console.log("Creating alpha tester record...");

  // Verify admin status first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error("No active session found");
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (profileError || !adminProfile?.is_admin) {
    console.error("Error verifying admin status:", profileError);
    throw new Error("Only administrators can add testers");
  }

  // Create alpha tester record
  const { error: testerError } = await supabase
    .from("alpha_testers")
    .insert({
      email,
      full_name: fullName,
      temporary_password: password,
      profile_id: userId,
      status: 'active',
      is_promoter: isPromoter
    });

  if (testerError) {
    console.error("Error creating alpha tester record:", testerError);
    throw testerError;
  }
};

export const sendWelcomeEmail = async (data: {
  email: string;
  fullName: string;
  temporaryPassword: string;
  isPromoter: boolean;
}) => {
  console.log("Sending welcome email to new tester");
  try {
    const { error: emailError } = await supabase.functions.invoke("send-alpha-welcome", {
      body: { 
        ...data,
        loginUrl: `${window.location.origin}/login`,
      },
    });

    if (emailError) {
      console.error("Error sending welcome email:", emailError);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
};