import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - MarketPro',
  description: 'Flexible pricing plans to fit your business needs and budget.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$999',
      period: '/month',
      description: 'Perfect for small businesses getting started with digital marketing.',
      features: [
        'Social Media Management (2 platforms)',
        'Monthly Content Calendar',
        'Basic SEO Optimization',
        '2 Blog Posts per month',
        'Monthly Performance Report',
        'Email Support',
      ],
      highlighted: false,
    },
    {
      name: 'Growth',
      price: '$2,499',
      period: '/month',
      description: 'Ideal for growing businesses ready to scale their marketing.',
      features: [
        'Social Media Management (4 platforms)',
        'Advanced Content Strategy',
        'Comprehensive SEO Campaign',
        '4 Blog Posts per month',
        'Email Marketing Campaigns',
        'Weekly Performance Reports',
        'Priority Support',
        'Dedicated Account Manager',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations with complex needs.',
      features: [
        'Full-Service Marketing',
        'Custom Strategy Development',
        'Advanced Analytics & BI',
        'Unlimited Content Creation',
        'Multi-Channel Campaigns',
        'Real-time Reporting',
        '24/7 Premium Support',
        'Dedicated Team',
        'Custom Integrations',
      ],
      highlighted: false,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
              <p className="text-xl text-primary-100">
                Choose the perfect plan for your business. No hidden fees, cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${
                    plan.highlighted
                      ? 'border-2 border-primary-600 shadow-2xl transform md:-translate-y-4'
                      : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      {plan.price === 'Custom' ? 'Contact Us' : 'Get Started'}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected
                  in your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a contract or commitment?
                </h3>
                <p className="text-gray-600">
                  Our standard plans are month-to-month with no long-term commitment. Enterprise
                  plans may have custom terms.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What if I need additional services?
                </h3>
                <p className="text-gray-600">
                  We offer à la carte services and custom packages. Contact us to discuss your
                  specific needs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
