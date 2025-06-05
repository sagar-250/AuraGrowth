"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

// Mock API responses
const mockAdResponse = {
  id: "ad123",
  description:"🌿 Eco Fresh Water Bottle Hydrate sustainably with this BPA-free, insulated bottle. Keeps drinks cold for 24 hours or hot for 12. Leak-proof, lightweight, and perfect for on-the-go.",
  image_url: "/ad2.jpeg",
}

const mockBlogResponse = {
  success: true,
  blog_content: `# Accelerating Startup Growth in 2023

![Startup Growth Chart](/images/startup-growth-chart.jpg)

In today's competitive landscape, startups need every advantage they can get. Aura Growth provides the essential tools that early-stage companies need to thrive.

## Why Startups Fail

According to research, over 90% of startups fail within their first year. The primary reasons include:

1. Poor market fit
2. Ineffective marketing
3. Inadequate customer communication
4. Lack of competitive analysis

## How Aura Growth Helps

Aura Growth addresses these challenges head-on with our suite of tools:

### Email Trackout
Our email management system helps you organize communications with leads, customers, and team members, ensuring nothing falls through the cracks.

### Media Manager
Create compelling ads and blog content quickly and efficiently, allowing you to focus on what matters most - building your product.

### Competitive Analysis
Stay ahead of the competition with detailed insights into what others in your industry are doing.

## Getting Started

Ready to take your startup to the next level? Sign up for Aura Growth today and experience the difference our tools can make for your business.`,
  error: null,
}

export default function ContentGeneration() {
  const [activeTab, setActiveTab] = useState("ad")
  const [adFormData, setAdFormData] = useState({
    name: "",
    description: "",
    tagline: "",
    brand_style: "",
  })
  const [blogFormData, setBlogFormData] = useState({
    name: "",
    description: "",
    tagline: "",
    points: ["", ""],
  })
  const [adResult, setAdResult] = useState<null | typeof mockAdResponse>(null)
  const [blogResult, setBlogResult] = useState<null | typeof mockBlogResponse>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      // Send the form data to the API endpoint
      const response = await fetch("http://localhost:8000/generate-ad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adFormData),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // Parse the response
      const data = await response.json()
      setAdResult(data)
    } catch (error) {
      console.error("Error generating ad:", error)
      // Use mock data with proper image URL
      setAdResult(mockAdResponse)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate API call
    setTimeout(() => {
      setBlogResult(mockBlogResponse)
      setIsGenerating(false)
    }, 1500)
  }

  const handleAdPost = () => {
    // Simulate posting to API
    alert("Ad posted successfully!")
    setAdResult(null)
    setAdFormData({
      name: "",
      description: "",
      tagline: "",
      brand_style: "",
    })
  }

  const handleBlogPost = () => {
    // Simulate posting to API
    alert("Blog posted successfully!")
    setBlogResult(null)
    setBlogFormData({
      name: "",
      description: "",
      tagline: "",
      points: ["", ""],
    })
  }

  const updateBlogPoint = (index: number, value: string) => {
    const newPoints = [...blogFormData.points]
    newPoints[index] = value
    setBlogFormData({
      ...blogFormData,
      points: newPoints,
    })
  }

  const addBlogPoint = () => {
    setBlogFormData({
      ...blogFormData,
      points: [...blogFormData.points, ""],
    })
  }

  // Function to format markdown content to HTML
  const formatMarkdown = (content: string) => {
    if (!content || typeof content !== "string") {
      return ""
    }

    // Process images
    let formatted = content.replace(
      /!\[(.*?)\]$$(.*?)$$/g,
      '<div class="my-6"><img src="$2" alt="$1" class="rounded-lg w-full" /></div>',
    )

    // Process headings
    formatted = formatted
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-3xl font-bold mt-6 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400">$1</h1>',
      )
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-5 mb-3 text-white">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2 text-violet-400">$1</h3>')

    // Process lists
    formatted = formatted.replace(/^\d+\. (.*)$/gm, '<li class="ml-6 mb-1 list-decimal text-gray-200">$1</li>')
    formatted = formatted.replace(/^- (.*)$/gm, '<li class="ml-6 mb-1 list-disc text-gray-200">$1</li>')

    // Wrap adjacent list items in ul/ol tags
    formatted = formatted.replace(
      /<li class="ml-6 mb-1 list-decimal text-gray-200">(.*?)<\/li>/gs,
      '<ol class="list-decimal my-3">$&</ol>',
    )
    formatted = formatted.replace(
      /<li class="ml-6 mb-1 list-disc text-gray-200">(.*?)<\/li>/gs,
      '<ul class="list-disc my-3">$&</ul>',
    )

    // Fix duplicate wrapping
    formatted = formatted.replace(
      /<ol class="list-decimal my-3">(<li.*?>.*?<\/li>)<\/ol>\s*<ol class="list-decimal my-3">(<li.*?>.*?<\/li>)<\/ol>/gs,
      '<ol class="list-decimal my-3">$1$2</ol>',
    )
    formatted = formatted.replace(
      /<ul class="list-disc my-3">(<li.*?>.*?<\/li>)<\/ul>\s*<ul class="list-disc my-3">(<li.*?>.*?<\/li>)<\/ul>/gs,
      '<ul class="list-disc my-3">$1$2</ul>',
    )

    // Process paragraphs (any line that's not a heading or list)
    const paragraphs = formatted.split("\n\n")
    return paragraphs
      .map((p) => {
        if (
          p &&
          typeof p === "string" &&
          !p.startsWith("<h1") &&
          !p.startsWith("<h2") &&
          !p.startsWith("<h3") &&
          !p.startsWith("<ol") &&
          !p.startsWith("<ul") &&
          !p.startsWith("<div") &&
          p.trim() !== ""
        ) {
          return `<p class="my-3 text-gray-300 leading-relaxed">${p}</p>`
        }
        return p
      })
      .filter(Boolean) // Remove any null/undefined values
      .join("\n\n")
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
          Media Manager
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Create compelling ads and blog content with our AI-powered generation tools to boost your marketing efforts.
        </p>
      </div>

      <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
        <Tabs defaultValue="ad" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger
              value="ad"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Ad Generation
            </TabsTrigger>
            <TabsTrigger
              value="blog"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Blog Generation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ad">
            {!adResult ? (
              <form onSubmit={handleAdSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ad-name">Product/Company Name</Label>
                  <Input
                    id="ad-name"
                    value={adFormData.name}
                    onChange={(e) => setAdFormData({ ...adFormData, name: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-description">Description</Label>
                  <Textarea
                    id="ad-description"
                    value={adFormData.description}
                    onChange={(e) => setAdFormData({ ...adFormData, description: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500 min-h-24"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-tagline">Tagline</Label>
                  <Input
                    id="ad-tagline"
                    value={adFormData.tagline}
                    onChange={(e) => setAdFormData({ ...adFormData, tagline: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-brand-style">Brand Style</Label>
                  <Input
                    id="ad-brand-style"
                    value={adFormData.brand_style}
                    onChange={(e) => setAdFormData({ ...adFormData, brand_style: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                    placeholder="Modern, Professional, Playful, etc."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Ad"}
                </Button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4">Generated Ad</h3>
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                      <p className="text-gray-300">{adResult.description}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4">Ad Image</h3>
                    <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-gray-800 bg-black">
  <Image
    src={adResult.image_url || "/placeholder.svg?height=300&width=500"}
    alt="Generated ad image"
    fill
    className="object-contain"
  />
</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAdPost}
                    className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                  >
                    Post Ad
                  </Button>
                  <Button
                    onClick={() => setAdResult(null)}
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    Regenerate
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="blog">
            {!blogResult ? (
              <form onSubmit={handleBlogSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="blog-name">Product/Company Name</Label>
                  <Input
                    id="blog-name"
                    value={blogFormData.name}
                    onChange={(e) => setBlogFormData({ ...blogFormData, name: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-description">Description</Label>
                  <Textarea
                    id="blog-description"
                    value={blogFormData.description}
                    onChange={(e) => setBlogFormData({ ...blogFormData, description: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500 min-h-24"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-tagline">Tagline</Label>
                  <Input
                    id="blog-tagline"
                    value={blogFormData.tagline}
                    onChange={(e) => setBlogFormData({ ...blogFormData, tagline: e.target.value })}
                    className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Key Points</Label>
                  {blogFormData.points.map((point, index) => (
                    <Input
                      key={index}
                      value={point}
                      onChange={(e) => updateBlogPoint(index, e.target.value)}
                      className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500 mb-2"
                      placeholder={`Point ${index + 1}`}
                      required
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBlogPoint}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    Add Point
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Blog"}
                </Button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Generated Blog Content</h3>
                {blogResult.header_image && (
                  <div className="mb-6">
                    <Image
                      src={blogResult.header_image || "/placeholder.svg"}
                      alt="Blog header image"
                      width={800}
                      height={400}
                      className="rounded-lg w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 max-h-[500px] overflow-y-auto">
                  <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(blogResult.blog_content) }}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleBlogPost}
                    className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                  >
                    Post Blog
                  </Button>
                  <Button
                    onClick={() => setBlogResult(null)}
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    Regenerate
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

