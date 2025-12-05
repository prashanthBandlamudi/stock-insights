import { create } from 'zustand';

interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionTier: 'free' | 'premium' | 'pro';
  setSubscribed: (subscribed: boolean, tier: 'free' | 'premium' | 'pro') => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isSubscribed: false,
  subscriptionTier: 'free',
  setSubscribed: (subscribed, tier) =>
    set({ isSubscribed: subscribed, subscriptionTier: tier }),
}));
