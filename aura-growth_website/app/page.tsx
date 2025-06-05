import { Mail, PenTool, TrendingUp, Search, Database } from "lucide-react"
import HeroSection from "@/components/hero-section"
import FeatureCard from "@/components/feature-card"

export default function Home() {
  return (
    <div>
      <HeroSection />

      <section id="features" className="container mx-auto py-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400">
            Essential Tools for Early-Stage Startups
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Aura Growth provides powerful tools designed specifically for startups looking to scale quickly and
            efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <FeatureCard
            icon={<Mail className="size-6 text-violet-400" />}
            title="Email Trackout"
            description="Manage different types of startup communications efficiently with our intelligent email tracking system."
            link="/email-trackout"
          />
          <FeatureCard
            icon={<PenTool className="size-6 text-blue-400" />}
            title="Media Manager"
            description="Create compelling ads and blog content with our AI-powered generation tools to boost your marketing efforts."
            link="/content-generation"
          />
          <FeatureCard
            icon={<TrendingUp className="size-6 text-cyan-400" />}
            title="Competitive Analysis"
            description="Stay ahead of the competition with detailed insights and analysis of your industry landscape."
            link="/competitive-analysis"
          />
          <FeatureCard
            icon={<Search className="size-6 text-green-400" />}
            title="Website SEO"
            description="Analyze your website's SEO performance and get AI-powered recommendations to improve your search rankings."
            link="/website-seo"
          />
          <FeatureCard
            icon={<Database className="size-6 text-purple-400" />}
            title="Notion Trackout"
            description="Query and analyze your Notion databases with powerful tools for insights and summaries."
            link="/notion-trackout"
          />
        </div>
      </section>
    </div>
  )
}

