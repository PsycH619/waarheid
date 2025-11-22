import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Search, Share2, PenTool, BarChart3, Mail, Megaphone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services - MarketPro',
  description: 'Comprehensive digital marketing services including SEO, social media, content creation, and more.',
};

export default function ServicesPage() {
  const services = [
    {
      icon: Search,
      title: 'SEO Optimization',
      description: 'Improve your search engine rankings and drive organic traffic with our proven SEO strategies.',
      features: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Link Building'],
    },
    {
      icon: Share2,
      title: 'Social Media Marketing',
      description: 'Build a strong social presence and engage with your audience across all major platforms.',
      features: ['Content Strategy', 'Community Management', 'Paid Advertising', 'Analytics'],
    },
    {
      icon: PenTool,
      title: 'Content Creation',
      description: 'Compelling content that resonates with your audience and drives conversions.',
      features: ['Blog Writing', 'Video Production', 'Graphic Design', 'Copywriting'],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Data-driven insights to measure performance and optimize your marketing strategy.',
      features: ['Custom Dashboards', 'Performance Reports', 'Conversion Tracking', 'ROI Analysis'],
    },
    {
      icon: Mail,
      title: 'Email Marketing',
      description: 'Nurture leads and build lasting relationships with targeted email campaigns.',
      features: ['Campaign Design', 'List Segmentation', 'A/B Testing', 'Automation'],
    },
    {
      icon: Megaphone,
      title: 'Brand Strategy',
      description: 'Develop a strong brand identity that sets you apart from the competition.',
      features: ['Brand Positioning', 'Visual Identity', 'Messaging', 'Brand Guidelines'],
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
              <p className="text-xl text-primary-100">
                Comprehensive digital marketing solutions tailored to your business needs.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Elevate Your Marketing?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Let's discuss which services are right for your business.
            </p>
            <Link href="/contact">
              <Button size="lg">Get Started Today</Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
