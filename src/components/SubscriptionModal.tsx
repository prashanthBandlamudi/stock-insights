import { motion } from 'framer-motion';
import { X, Check, Zap, Crown, Infinity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStore } from '@/store/subscriptionStore';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { setSubscribed } = useSubscriptionStore();

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      icon: Zap,
      color: 'primary',
      features: [
        'View 5 stocks',
        'Basic fundamentals',
        'Limited charts',
        'No portfolio tracking',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      name: 'Premium',
      price: '₹499',
      period: '/month',
      icon: Crown,
      color: 'secondary',
      features: [
        'View 50 stocks',
        'Advanced fundamentals',
        'Interactive charts',
        'Portfolio tracking',
        'Technical indicators',
        'Email support',
      ],
      cta: 'Upgrade Now',
      disabled: false,
      popular: true,
    },
    {
      name: 'Pro',
      price: '₹999',
      period: '/month',
      icon: Infinity,
      color: 'data-highlight',
      features: [
        'Unlimited stocks',
        'All Premium features',
        'Real-time data',
        'Advanced analytics',
        'Custom alerts',
        'Priority support',
        'API access',
      ],
      cta: 'Upgrade Now',
      disabled: false,
    },
  ];

  const handleUpgrade = (tier: 'premium' | 'pro') => {
    setSubscribed(true, tier);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-white/10 max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-heading font-bold text-foreground text-center">
            Choose Your <span className="text-primary">Plan</span>
          </DialogTitle>
          <p className="text-center text-foreground/70 font-paragraph mt-2">
            Unlock advanced features and unlimited stock analysis
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border backdrop-blur-lg transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/50 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-black font-paragraph">
                    Most Popular
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-${plan.color}/20 border border-${plan.color}/30 flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${plan.color}`} />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-4xl font-heading font-bold text-${plan.color}`}>
                      {plan.price}
                    </span>
                    <span className="text-foreground/60 font-paragraph">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 font-paragraph text-foreground/80">
                      <Check className={`h-5 w-5 text-${plan.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    if (plan.name === 'Premium') handleUpgrade('premium');
                    if (plan.name === 'Pro') handleUpgrade('pro');
                  }}
                  disabled={plan.disabled}
                  className={`w-full py-6 font-paragraph text-lg rounded-lg ${
                    plan.disabled
                      ? 'bg-white/10 text-foreground/50 cursor-not-allowed'
                      : `bg-${plan.color} text-black hover:bg-${plan.color}/90`
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-white/10 pt-8">
          <h4 className="text-lg font-heading font-bold text-foreground mb-4">
            All plans include:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Secure data encryption',
              'Mobile app access',
              'Regular updates',
              'Community access',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 font-paragraph text-foreground/70">
                <Check className="h-5 w-5 text-primary" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
