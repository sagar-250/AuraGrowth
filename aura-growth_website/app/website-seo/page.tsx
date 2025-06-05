"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  ExternalLink,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BarChart,
  FileText,
  Cpu,
  Smartphone,
  Users,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Mock SEO analysis data with updated metrics based on industry standards
const mockSeoAnalysis = {
  url: "https://example.com",
  score: 72,
  contentAnalysis: {
    score: 75,
    technicalSeoElements: {
      headingStructure: "Proper H1-H6 usage",
      internalLinking: "12 internal links",
      externalLinking: "5 external links",
      imageAltText: "Missing on 4 images",
      schemaMarkup: "Partially implemented",
      canonicalization: "Properly implemented",
    },
    contentQuality: {
      wordCount: "1,245 words",
      readability: "Grade 8 (Good)",
      paragraphStructure: "Well-structured",
      contentDepth: "Moderate depth",
      uniqueContent: "92% unique",
      contentGaps: "3 major topic areas not covered",
    },
    userExperienceFactors: {
      interactiveElements: "Properly functioning",
      navigationStructure: "Clear and intuitive",
      pageLayout: "Clean but could be improved",
      contentOrganization: "Logical flow",
      visualElements: "Limited use of visuals",
      pageSpeed: "Moderate (78/100)",
    },
    eatAssessment: {
      expertise: "Moderate expertise demonstrated",
      experience: "Limited first-hand experience shown",
      authoritativeness: "Some authoritative sources cited",
      trustworthiness: "Privacy policy and contact information present",
      aboutPage: "Present but lacks detail",
      authorCredentials: "Missing author bios",
    },
    issues: [
      "Content is slightly thin for the topic (1,245 words)",
      "Limited demonstration of E-E-A-T signals",
      "Some paragraphs are too long (over 300 words)",
      "Limited use of visual content to support text",
      "No author credentials or expertise information",
    ],
    suggestions: [
      "Expand content to at least 1,800 words for comprehensive coverage",
      "Add author bio with credentials to improve E-E-A-T signals",
      "Break up long paragraphs into smaller, more digestible chunks",
      "Add more relevant visuals, charts, and infographics",
      "Include more authoritative citations and references",
    ],
  },
  keywordOptimization: {
    score: 81,
    primaryAnalysis: {
      primaryKeyword: "startup growth tools",
      keywordDensity: "1.8%",
      titleTagOptimization: "Present but not optimized",
      metaDescriptionOptimization: "Present but too short",
      urlOptimization: "Properly optimized",
      headingsOptimization: "Primary keyword in H1",
      keywordVariations: "Limited use of synonyms and variations",
    },
    competitiveContext: {
      keywordDifficulty: "Medium (65/100)",
      serp: "Position #8 for primary keyword",
      competitorKeywords: "Missing 12 keywords used by top competitors",
      contentGaps: "3 major topic areas not covered",
      competitorBacklinks: "42% fewer backlinks than top competitors",
      rankingPotential: "Moderate with improvements",
    },
    contentIntegration: {
      keywordVariations: "Limited use of synonyms and variations",
      semanticRelevance: "Moderate semantic relevance",
      internalLinking: "12 internal links",
      externalLinking: "5 external links",
      imageAltText: "Missing on 4 images",
      entityOptimization: "Limited entity associations",
    },
    issues: [
      "Meta description is too short (87 characters)",
      "Title tag is not optimized for target keywords",
      "Limited use of keyword variations and synonyms",
      "Missing content on key topics covered by competitors",
      "4 images are missing alt text with keywords",
    ],
    suggestions: [
      "Extend meta description to 150-160 characters with relevant keywords",
      "Include primary keyword at the beginning of the title tag",
      "Add more semantic variations of your target keywords",
      "Create content addressing the 3 topic gaps identified",
      "Add descriptive alt text with relevant keywords to all images",
    ],
  },
  technicalSeo: {
    score: 68,
    coreWebVitals: {
      LCP: "2.9s", // Largest Contentful Paint
      FID: "120ms", // First Input Delay
      CLS: "0.12", // Cumulative Layout Shift
      TTFB: "320ms", // Time to First Byte
      FCP: "1.8s", // First Contentful Paint
      INP: "210ms", // Interaction to Next Paint
    },
    technicalImplementation: {
      httpsStatus: "Secure",
      robotsTxt: "Properly configured",
      sitemapXml: "Present but outdated",
      structuredData: "Partially implemented",
      canonicalization: "Properly implemented",
      hreflang: "Missing for multilingual pages",
      indexability: "No indexation issues detected",
    },
    mobileOptimization: {
      viewport: "Properly configured",
      tapTargets: "Some elements too close",
      fontSizes: "Readable",
      contentWidth: "Requires horizontal scrolling on some pages",
      acceleratedMobilePages: "Not implemented",
      mobileSpeed: "Slow (65/100)",
    },
    advancedTechnical: {
      serverResponse: "HTTP/2 enabled",
      compressionStatus: "GZIP enabled",
      jsMinification: "Partially minified",
      cssMinification: "Properly minified",
      renderBlockingResources: "5 resources blocking rendering",
      lazyLoading: "Not implemented for images",
      cdnUsage: "Not implemented",
      caching: "Browser caching enabled but not optimized",
    },
    issues: [
      "Core Web Vitals: LCP exceeds recommended 2.5s threshold",
      "Render-blocking resources detected",
      "Images are not properly sized and optimized",
      "Structured data implementation is incomplete",
      "No AMP implementation for mobile pages",
    ],
    suggestions: [
      "Implement lazy loading for below-the-fold images",
      "Minify and compress all JavaScript files",
      "Consider using a Content Delivery Network (CDN)",
      "Complete structured data implementation for all relevant page types",
      "Implement server-side caching to improve TTFB",
    ],
  },
  aiInsights: [
    "Your website's content appears to be targeting a broad audience, but your keyword strategy suggests a more specialized focus. Consider aligning your content more closely with your target keywords.",
    "The site structure could be improved by reorganizing content into topic clusters, which would help search engines better understand your site's hierarchy and expertise areas.",
    "Your competitors are outperforming you in mobile performance. Prioritizing mobile optimization could give you a competitive edge in search rankings.",
    "The current meta descriptions aren't compelling enough to maximize click-through rates. They should include clear value propositions and calls to action.",
    "Consider implementing schema markup for your products/services to enhance your search result appearance with rich snippets.",
    "Your E-E-A-T signals are weak compared to competitors. Adding author bios, credentials, and more authoritative citations would improve trustworthiness.",
    "The content gaps in key topic areas are likely affecting your topical authority. Creating comprehensive content clusters would strengthen your position.",
  ],
}

export default function WebsiteSeo() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<typeof mockSeoAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError(null)

    // Validate URL format
    if (!url.match(/^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/)) {
      setError("Please enter a valid URL including http:// or https://")
      setIsAnalyzing(false)
      return
    }

    try {
      // Simulate API call
      console.log("Analyzing URL:", url)

      // In a real implementation, you would call your SEO analysis API here
      // const response = await fetch("/api/analyze-seo", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ url }),
      // });
      // const data = await response.json();

      // For demo purposes, we'll use mock data after a delay
      setTimeout(() => {
        const mockData = { ...mockSeoAnalysis, url }
        setAnalysis(mockData)
        setIsAnalyzing(false)
      }, 7000)
    } catch (err) {
      console.error("Error analyzing website:", err)
      setError("An error occurred while analyzing the website. Please try again.")
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-cyan-400"
    if (score >= 50) return "text-amber-400"
    return "text-red-400"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-cyan-500"
    if (score >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  const renderScoreIndicator = (score: number, size = "large") => {
    const colorClass = getScoreColor(score)
    return (
      <div
        className={`flex items-center justify-center ${size === "large" ? "w-32 h-32" : "w-16 h-16"} rounded-full border-4 ${colorClass.replace("text", "border")}`}
      >
        <span className={`${colorClass} ${size === "large" ? "text-4xl" : "text-xl"} font-bold`}>{score}</span>
      </div>
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
          Website SEO Analysis
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Get a comprehensive analysis of your website's SEO performance and receive AI-powered recommendations to
          improve your search engine rankings.
        </p>
      </div>

      <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
        {!analysis ? (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Enter your website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                    placeholder="https://example.com"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : <Search className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Include http:// or https:// in your URL</p>
              </div>

              {error && (
                <div className="text-red-400 text-sm p-2 bg-red-400/10 border border-red-400/20 rounded">{error}</div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-4"></div>
                  <p className="text-gray-300">Analyzing your website...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a minute</p>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">SEO Analysis for:</h2>
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
                >
                  {analysis.url} <ExternalLink className="ml-1 size-4" />
                </a>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysis(null)
                  setError(null)
                }}
                className="border-gray-700 hover:bg-gray-800"
              >
                New Analysis
              </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
                >
                  <FileText className="size-4 mr-2" />
                  Content Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="keywords"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
                >
                  <BarChart className="size-4 mr-2" />
                  Keyword Optimization
                </TabsTrigger>
                <TabsTrigger
                  value="technical"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
                >
                  <Cpu className="size-4 mr-2" />
                  Technical SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-6 text-center">Overall SEO Score</h3>
                    <div className="flex justify-center mb-6">{renderScoreIndicator(analysis.score)}</div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Content Analysis</span>
                          <span className={getScoreColor(analysis.contentAnalysis.score)}>
                            {analysis.contentAnalysis.score}
                          </span>
                        </div>
                        <Progress
                          value={analysis.contentAnalysis.score}
                          className="h-2"
                          indicatorClassName={getProgressColor(analysis.contentAnalysis.score)}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Keyword Optimization</span>
                          <span className={getScoreColor(analysis.keywordOptimization.score)}>
                            {analysis.keywordOptimization.score}
                          </span>
                        </div>
                        <Progress
                          value={analysis.keywordOptimization.score}
                          className="h-2"
                          indicatorClassName={getProgressColor(analysis.keywordOptimization.score)}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Technical SEO</span>
                          <span className={getScoreColor(analysis.technicalSeo.score)}>
                            {analysis.technicalSeo.score}
                          </span>
                        </div>
                        <Progress
                          value={analysis.technicalSeo.score}
                          className="h-2"
                          indicatorClassName={getProgressColor(analysis.technicalSeo.score)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Lightbulb className="text-amber-400 mr-2 size-5" />
                      AI Insights
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {analysis.aiInsights.map((insight, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="size-5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Content Score</h3>
                        <div className={`text-lg font-bold ${getScoreColor(analysis.contentAnalysis.score)}`}>
                          {analysis.contentAnalysis.score}/100
                        </div>
                      </div>
                      <div className="flex justify-center mb-6">
                        {renderScoreIndicator(analysis.contentAnalysis.score, "large")}
                      </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Award className="text-amber-400 mr-2 size-5" />
                        E-E-A-T Assessment
                      </h3>
                      <table className="w-full">
                        <tbody>
                          {Object.entries(analysis.contentAnalysis.eatAssessment).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-800 last:border-0">
                              <td className="py-2 text-gray-400">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                              </td>
                              <td className="py-2 text-right font-medium">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Technical SEO Elements</h3>
                        <table className="w-full">
                          <tbody>
                            {Object.entries(analysis.contentAnalysis.technicalSeoElements).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 text-gray-400">
                                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </td>
                                <td className="py-2 text-right font-medium">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Content Analysis</h3>
                        <table className="w-full">
                          <tbody>
                            {Object.entries(analysis.contentAnalysis.contentQuality).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 text-gray-400">
                                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </td>
                                <td className="py-2 text-right font-medium">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4">
                        <Users className="text-cyan-400 mr-2 size-5 inline" />
                        User Experience Factors
                      </h3>
                      <table className="w-full">
                        <tbody>
                          {Object.entries(analysis.contentAnalysis.userExperienceFactors).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-800 last:border-0">
                              <td className="py-2 text-gray-400">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                              </td>
                              <td className="py-2 text-right font-medium">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <XCircle className="text-red-400 mr-2 size-5" />
                          Issues Detected
                        </h3>
                        <ul className="space-y-2">
                          {analysis.contentAnalysis.issues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <AlertTriangle className="text-amber-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <Lightbulb className="text-cyan-400 mr-2 size-5" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {analysis.contentAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <ArrowRight className="text-cyan-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="mt-0">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Keyword Score</h3>
                        <div className={`text-lg font-bold ${getScoreColor(analysis.keywordOptimization.score)}`}>
                          {analysis.keywordOptimization.score}/100
                        </div>
                      </div>
                      <div className="flex justify-center mb-6">
                        {renderScoreIndicator(analysis.keywordOptimization.score, "large")}
                      </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center">
                        <BarChart className="text-violet-400 mr-2 size-5" />
                        Primary Analysis
                      </h3>
                      <table className="w-full">
                        <tbody>
                          {Object.entries(analysis.keywordOptimization.primaryAnalysis).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-800 last:border-0">
                              <td className="py-2 text-gray-400">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                              </td>
                              <td className="py-2 text-right font-medium">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Competitive Context</h3>
                        <table className="w-full">
                          <tbody>
                            {Object.entries(analysis.keywordOptimization.competitiveContext).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 text-gray-400">
                                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </td>
                                <td className="py-2 text-right font-medium">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Content Integration</h3>
                        <table className="w-full">
                          <tbody>
                            {Object.entries(analysis.keywordOptimization.contentIntegration).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 text-gray-400">
                                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </td>
                                <td className="py-2 text-right font-medium">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <XCircle className="text-red-400 mr-2 size-5" />
                          Issues Detected
                        </h3>
                        <ul className="space-y-2">
                          {analysis.keywordOptimization.issues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <AlertTriangle className="text-amber-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <Lightbulb className="text-cyan-400 mr-2 size-5" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {analysis.keywordOptimization.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <ArrowRight className="text-cyan-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="mt-0">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Technical Score</h3>
                        <div className={`text-lg font-bold ${getScoreColor(analysis.technicalSeo.score)}`}>
                          {analysis.technicalSeo.score}/100
                        </div>
                      </div>
                      <div className="flex justify-center mb-6">
                        {renderScoreIndicator(analysis.technicalSeo.score, "large")}
                      </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Cpu className="text-violet-400 mr-2 size-5" />
                        Core Web Vitals
                      </h3>
                      <table className="w-full">
                        <tbody>
                          {Object.entries(analysis.technicalSeo.coreWebVitals).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-800 last:border-0">
                              <td className="py-2 text-gray-400">{key}</td>
                              <td
                                className={`py-2 text-right font-medium ${
                                  key === "LCP" && Number.parseFloat(value) > 2.5
                                    ? "text-amber-400"
                                    : key === "FID" && Number.parseFloat(value) > 100
                                      ? "text-amber-400"
                                      : key === "CLS" && Number.parseFloat(value) > 0.1
                                        ? "text-amber-400"
                                        : key === "TTFB" && Number.parseFloat(value) > 300
                                          ? "text-amber-400"
                                          : key === "FCP" && Number.parseFloat(value) > 1.8
                                            ? "text-amber-400"
                                            : key === "INP" && Number.parseFloat(value) > 200
                                              ? "text-amber-400"
                                              : "text-green-400"
                                }`}
                              >
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Technical Implementation</h3>
                        <table className="w-full">
                          <tbody>
                            {Object.entries(analysis.technicalSeo.technicalImplementation).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 text-gray-400">
                                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </td>
                                <td className="py-2 text-right font-medium">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">
                          <Smartphone className="text-cyan-400 mr-2 size-5 inline" />
                          Mobile Optimization
                        </h3>
                        <table className="w-full">
                          <tbody>
                            {Object.entries(analysis.technicalSeo.mobileOptimization).map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-800 last:border-0">
                                <td className="py-2 text-gray-400">
                                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </td>
                                <td className="py-2 text-right font-medium">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Advanced Technical Elements</h3>
                      <table className="w-full">
                        <tbody className="grid md:grid-cols-2 gap-x-4">
                          {Object.entries(analysis.technicalSeo.advancedTechnical).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-800 last:border-0">
                              <td className="py-2 text-gray-400">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                              </td>
                              <td className="py-2 text-right font-medium">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <XCircle className="text-red-400 mr-2 size-5" />
                          Issues Detected
                        </h3>
                        <ul className="space-y-2">
                          {analysis.technicalSeo.issues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <AlertTriangle className="text-amber-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                          <Lightbulb className="text-cyan-400 mr-2 size-5" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {analysis.technicalSeo.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <ArrowRight className="text-cyan-400 size-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

