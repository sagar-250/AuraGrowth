"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

// Mock data with lists for initiatives, novelties, and achievements
// Sources are now simple arrays of URLs
const mockCompetitors = [
  {
    name: "GrowthPilot",
    initiatives: ["AI-Powered Marketing Assistant", "Automated Ad Campaign Optimization", "Content Strategy Generator"],
    novelties: [
      "Uses machine learning to optimize ad spend and content strategy",
      "Real-time market trend analysis",
      "Competitor benchmarking with predictive insights",
    ],
    achievements: [
      "Helped startups reduce CAC by 35% on average",
      "Increased conversion rates by 28% for SaaS clients",
      "Named 'Top MarTech Tool' by Industry Weekly",
    ],
    sources: [
      "https://example.com/growthpilot",
      "https://example.com/techcrunch/growthpilot",
      "https://example.com/producthunt/growthpilot",
    ],
  },
  {
    name: "LaunchPad",
    initiatives: ["All-in-One Startup Toolkit", "Legal Document Generator", "Financial Modeling Suite"],
    novelties: [
      "Integrated legal, financial, and marketing tools in one platform",
      "AI-powered business plan creation",
      "Compliance automation for multiple jurisdictions",
    ],
    achievements: [
      "Over 10,000 startups launched using their platform",
      "Reduced startup legal costs by 60%",
      "Helped clients secure $120M in seed funding",
    ],
    sources: ["https://example.com/launchpad", "https://example.com/forbes/launchpad"],
  },
  {
    name: "ScaleX",
    initiatives: ["Growth Hacking Framework", "Viral Loop Designer", "Referral Program Builder"],
    novelties: [
      "Proprietary methodology for rapid experimentation and scaling",
      "Data-driven growth model customized by industry",
      "Automated A/B testing with statistical significance analysis",
    ],
    achievements: [
      "Helped 5 unicorns in their early growth stages",
      "Average client growth rate of 22% MoM",
      "Developed the 'Scale Matrix' methodology used by top accelerators",
    ],
    sources: [
      "https://example.com/scalex/blog",
      "https://example.com/scalex/cases",
      "https://example.com/podcast/scalex",
    ],
  },
  {
    name: "VentureBoost",
    initiatives: ["Funding Readiness Platform", "Investor Matching Algorithm", "Pitch Deck Generator"],
    novelties: [
      "AI-driven pitch deck creation and investor matching",
      "Sentiment analysis of investor feedback",
      "Funding probability predictor based on business metrics",
    ],
    achievements: [
      "Startups raised over $500M collectively",
      "85% success rate for Series A introductions",
      "Average time to funding reduced by 40%",
    ],
    sources: ["https://example.com/ventureboost", "https://example.com/vc-database/ventureboost"],
  },
]

// Define the expected API response type
interface CompetitorData {
  name: string
  initiatives: string[]
  novelties: string[]
  achievements: string[]
  sources: string[]
}

// Function to validate and normalize competitor data
const normalizeCompetitorData = (data: any): CompetitorData => {
  return {
    name: data.name || "Unknown Competitor",
    initiatives: Array.isArray(data.initiatives) ? data.initiatives : [],
    novelties: Array.isArray(data.novelties) ? data.novelties : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    sources: Array.isArray(data.sources) ? data.sources : [],
  }
}

export default function CompetitiveAnalysis() {
  const [industry, setIndustry] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [competitors, setCompetitors] = useState<CompetitorData[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError(null)
    setIsUsingMockData(false)

    // Log the exact query being sent
    console.log("Sending user query to API:", industry)

    try {
      // Send the query to the backend
      const response = await fetch("http://127.0.0.1:3000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_query: industry }),
      })

      // Log the response for debugging
      console.log("API Response status:", response.status)

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      try {
        // Parse the response
        const data = await response.json()
        console.log("API Response data:", data)

        // If we have valid data from the API, use it
        if (data && Array.isArray(data)) {
          // Normalize the data to ensure all required properties exist
          const normalizedData = data.map((competitor) => normalizeCompetitorData(competitor))
          setCompetitors(normalizedData)
          setIsAnalyzing(false)
        } else {
          // If the API returned something but not in the expected format
          throw new Error("API response format is not as expected")
        }
      } catch (parseError) {
        console.log("Could not parse response as JSON or invalid format:", parseError)
        throw new Error("Failed to parse API response")
      }
    } catch (err) {
      console.error("Error with API request:", err)
      // Only show mock data when the API request fails
      setError("Could not connect to analysis service. Showing sample data instead.")
      setIsUsingMockData(true)

      // Use mock data as fallback
      setTimeout(() => {
        setCompetitors(mockCompetitors)
        setIsAnalyzing(false)
      }, 1000)
    }
  }

  // Render the competitor card with null checks
  const renderCompetitorCard = (competitor: CompetitorData, index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative group"
      >
        <div className="p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
          <h3 className="text-xl font-bold mb-4 text-violet-400">{competitor.name || "Unknown Competitor"}</h3>

          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Key Initiatives</h4>
              <ul className="space-y-1.5">
                {(competitor.initiatives || []).map((initiative, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-cyan-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">{initiative}</span>
                  </li>
                ))}
                {(!competitor.initiatives || competitor.initiatives.length === 0) && (
                  <li className="text-gray-500 text-sm">No initiatives found</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Innovation Factors</h4>
              <ul className="space-y-1.5">
                {(competitor.novelties || []).map((novelty, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-violet-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">{novelty}</span>
                  </li>
                ))}
                {(!competitor.novelties || competitor.novelties.length === 0) && (
                  <li className="text-gray-500 text-sm">No innovation factors found</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Notable Achievements</h4>
              <ul className="space-y-1.5">
                {(competitor.achievements || []).map((achievement, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-blue-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">{achievement}</span>
                  </li>
                ))}
                {(!competitor.achievements || competitor.achievements.length === 0) && (
                  <li className="text-gray-500 text-sm">No achievements found</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Sources</h4>
              <div className="flex flex-wrap gap-2">
                {(competitor.sources || []).map((sourceUrl, sourceIndex) => (
                  <Link
                    key={sourceIndex}
                    href={sourceUrl}
                    target="_blank"
                    className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-gray-800 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700 transition-colors"
                  >
                    Source {sourceIndex + 1} <ExternalLink className="ml-1 size-3" />
                  </Link>
                ))}
                {(!competitor.sources || competitor.sources.length === 0) && (
                  <span className="text-gray-500 text-xs">No sources available</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-cyan-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 size-4" /> Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400">
          Competitive Analysis
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Stay ahead of the competition with detailed insights and analysis of your industry landscape. Discover what
          your competitors are doing and how you can differentiate your startup.
        </p>
      </div>

      <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
        {!competitors ? (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Describe your industry or target area</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                  placeholder="e.g., SaaS for early-stage startups, FinTech for small businesses"
                  required
                />
              </div>

              {error && (
                <div className="text-amber-400 text-sm p-2 bg-amber-400/10 border border-amber-400/20 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Competition"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Competitive Landscape: {industry}
                {isUsingMockData && (
                  <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                    Sample Data
                  </span>
                )}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setCompetitors(null)
                  setError(null)
                  setIsUsingMockData(false)
                }}
                className="border-gray-700 hover:bg-gray-800"
              >
                New Analysis
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Array.isArray(competitors) &&
                competitors.map((competitor, index) => renderCompetitorCard(competitor, index))}

              {(!competitors || competitors.length === 0) && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  No competitor data found. Try refining your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

