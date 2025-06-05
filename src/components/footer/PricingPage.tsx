import React from 'react';
import { Check, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: 49,
      description: 'Perfect for small businesses',
      features: [
        'Up to 5 users',
        'Basic quality control',
        'Document management',
        'Email support',
        'Basic reporting'
      ],
      limitations: [
        'Advanced analytics',
        'API access',
        'Custom workflows',
        'Priority support'
      ]
    },
    {
      name: 'Professional',
      price: 99,
      description: 'Ideal for growing companies',
      features: [
        'Up to 20 users',
        'Advanced quality control',
        'Document management',
        'Email & phone support',
        'Advanced reporting',
        'Basic API access',
        'Custom workflows'
      ],
      limitations: [
        'White-label options',
        'Dedicated support'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations',
      features: [
        'Unlimited users',
        'Full quality suite',
        'Advanced document management',
        '24/7 priority support',
        'Custom reporting',
        'Full API access',
        'Custom workflows',
        'White-label options',
        'Dedicated support team'
      ],
      limitations: []
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include core quality management features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card 
            key={index}
            className={plan.popular ? 'border-2 border-[var(--primary-main)] relative' : ''}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-[var(--primary-main)] text-white px-4 py-1 rounded-bl-lg">
                Popular
              </div>
            )}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-[var(--text-secondary)] mb-4">{plan.description}</p>
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-[var(--text-secondary)] ml-2">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center">
                  <Check size={20} className="text-[var(--success-main)] mr-2" />
                  <span>{feature}</span>
                </div>
              ))}
              {plan.limitations.map((limitation, limitationIndex) => (
                <div key={limitationIndex} className="flex items-center text-[var(--text-secondary)]">
                  <X size={20} className="text-[var(--error-main)] mr-2" />
                  <span>{limitation}</span>
                </div>
              ))}
            </div>

            <Button
              variant={plan.popular ? 'primary' : 'outline'}
              className="w-full"
            >
              Get Started
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Need a Custom Plan?</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Contact us for custom pricing and features tailored to your organization's needs.
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PricingPage;