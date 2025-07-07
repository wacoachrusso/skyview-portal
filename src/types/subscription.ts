export interface Subscription {
    id: number;
    created_at: string;
    updated_at: string; 
    payment_status: 'active' | 'inactive' | 'canceled' | string;
    price: number | null;
    start_at: string; 
    end_at: string;
    user_id: string;
    old_plan: string | null;
    plan: 'monthly' | 'annual' | string;
    stripe_subscription_id: string;
  }