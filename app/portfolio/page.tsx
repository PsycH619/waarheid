import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio - MarketPro',
  description: 'Explore our successful marketing campaigns and client case studies.',
};

export default function PortfolioPage() {
  const projects = [
    {
      title: 'E-commerce Revenue Growth',
      client: 'TechGadgets Inc.',
      category: 'E-commerce',
      description:
        'Implemented a comprehensive SEO and paid ads strategy that increased organic traffic by 250% and revenue by 180% in 6 months.',
      results: [
        '250% increase in organic traffic',
        '180% revenue growth',
        '3.5x ROI on ad spend',
      ],
      tags: ['SEO', 'PPC', 'Analytics'],
    },
    {
      title: 'Brand Awareness Campaign',
      client: 'GreenLife Foods',
      category: 'Food & Beverage',
      description:
        'Launched a multi-channel brand awareness campaign that established the client as a thought leader in sustainable food production.',
      results: [
        '500K+ social media impressions',
        '45% increase in brand recognition',
        '10K new email subscribers',
      ],
      tags: ['Social Media', 'Content', 'Branding'],
    },
    {
      title: 'SaaS Lead Generation',
      client: 'CloudFlow Solutions',
      category: 'Technology',
      description:
        'Developed and executed a targeted B2B lead generation campaign that significantly improved qualified lead flow.',
      results: [
        '300+ qualified leads/month',
        '25% increase in demo requests',
        '40% reduction in CAC',
      ],
      tags: ['B2B Marketing', 'Email', 'LinkedIn'],
    },
    {
      title: 'Local Business Expansion',
      client: 'Fitness First Gyms',
      category: 'Health & Fitness',
      description:
        'Helped a local gym chain expand to 5 new locations through targeted local SEO and community engagement strategies.',
      results: [
        '5 new locations opened',
        '400% increase in local searches',
        '2,000+ new memberships',
      ],
      tags: ['Local SEO', 'Social Media', 'Community'],
    },
    {
      title: 'Product Launch Campaign',
      client: 'InnovateTech',
      category: 'Technology',
      description:
        'Orchestrated a successful product launch that exceeded all targets and generated significant market buzz.',
      results: [
        '10,000 pre-orders in first week',
        '1M+ social media reach',
        'Featured in 20+ publications',
      ],
      tags: ['Product Launch', 'PR', 'Social Media'],
    },
    {
      title: 'Content Marketing Success',
      client: 'LegalEase Advisors',
      category: 'Professional Services',
      description:
        'Built a content marketing engine that positioned the firm as industry experts and drove consistent inbound leads.',
      results: [
        '150+ published articles',
        '500% increase in blog traffic',
        '60% of leads from content',
      ],
      tags: ['Content Marketing', 'SEO', 'Thought Leadership'],
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Work</h1>
              <p className="text-xl text-primary-100">
                Real results for real businesses. Explore how we've helped our clients achieve
                their marketing goals.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.client} • {project.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Results:</h4>
                      <ul className="space-y-1">
                        {project.results.map((result, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <ArrowRight className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, idx) => (
                        <Badge key={idx} variant="info">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Let's discuss how we can help you achieve similar results.
            </p>
            <Link href="/contact">
              <Button size="lg">Start Your Project</Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
