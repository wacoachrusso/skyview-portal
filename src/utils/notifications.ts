import { supabase } from "@/integrations/supabase/client";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'app_update' | 'negotiation' | 'general' = 'general'
) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type
        }
      ]);

    if (error) throw error;
    console.log('Notification created successfully');
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}