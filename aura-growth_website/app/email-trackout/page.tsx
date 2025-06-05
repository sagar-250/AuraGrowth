"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Mock data
const mockEmails = {
  leads: [
    {
      id: 1,
      message_id: "lead-123",
      sender: "john@company.com",
      subject: "Partnership opportunity",
      body: "Hi there, I'm interested in exploring a partnership with your startup. Our company specializes in...",
    },
    {
      id: 2,
      message_id: "lead-456",
      sender: "sarah@investor.com",
      subject: "Investment interest",
      body: "Hello, I represent a group of angel investors who are interested in your product. We'd like to schedule a call to discuss...",
    },
    {
      id: 3,
      message_id: "lead-789",
      sender: "mike@client.com",
      subject: "Product inquiry",
      body: "I recently came across your product and I'm very interested in learning more about how it could help my business...",
    },
  ],
  user_query: [
    {
      id: 1,
      message_id: "query-123",
      sender: "customer@gmail.com",
      subject: "How do I reset my password?",
      body: "I've been trying to log in but I forgot my password. I tried the reset option but I'm not receiving any emails...",
    },
    {
      id: 2,
      message_id: "query-456",
      sender: "user@outlook.com",
      subject: "Feature request",
      body: "I love your product but I think it would be even better if you could add the ability to export data to CSV. Is this something you're planning?",
    },
    {
      id: 3,
      message_id: "query-789",
      sender: "client@business.com",
      subject: "Billing question",
      body: "I noticed I was charged twice this month. Could you please look into this and help me resolve the issue?",
    },
  ],
  internal: [
    {
      id: 1,
      message_id: "internal-123",
      sender: "alex@ourcompany.com",
      subject: "Weekly team update",
      body: "Team, here's a summary of what we accomplished this week: 1. Launched new feature X, 2. Fixed critical bug Y, 3. Onboarded 5 new enterprise customers...",
    },
    {
      id: 2,
      message_id: "internal-456",
      sender: "lisa@ourcompany.com",
      subject: "Product roadmap",
      body: "I've updated our Q3 roadmap based on recent customer feedback. Key priorities include: improving onboarding flow, adding export functionality, and optimizing...",
    },
    {
      id: 3,
      message_id: "internal-789",
      sender: "ceo@ourcompany.com",
      subject: "All hands meeting",
      body: "Please join our all-hands meeting this Friday at 2pm. We'll be discussing our recent funding round and plans for expansion...",
    },
  ],
}

interface Email {
  id: number
  message_id: string
  sender: string
  subject: string
  body: string
}

export default function EmailTrackout() {
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currentEmails, setCurrentEmails] = useState<Record<string, Email>>({})
  const [activeTab, setActiveTab] = useState("leads")

  const [databaseId, setDatabaseId] = useState("")
  const [filterParams, setFilterParams] = useState("")
  const [queryResults, setQueryResults] = useState<null | any>(null)
  const [isQuerying, setIsQuerying] = useState(false)

  const [summaryDatabaseId, setSummaryDatabaseId] = useState("")
  const [summary, setSummary] = useState<null | string>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  useEffect(() => {
    // Create a lookup map of all emails by message_id for easy access
    const emailMap: Record<string, Email> = {}
    ;[...mockEmails.leads, ...mockEmails.user_query, ...mockEmails.internal].forEach((email) => {
      emailMap[email.message_id] = email
    })
    setCurrentEmails(emailMap)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [successMessage])

  const toggleEmail = (id: string) => {
    setExpandedEmails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSendReply = (messageId: string) => {
    // Here you would send the reply to your backend API
    console.log("Sending reply to message:", messageId, "Content:", replyContent)

    // Get the sender from the current email
    const email = currentEmails[messageId]
    if (email) {
      // Show success message with sender
      setSuccessMessage(`Reply sent to ${email.sender}`)
    }

    // Reset state
    setReplyingTo(null)
    setReplyContent("")
  }

  const handleTabChange = (value: string) => {
    // Close any expanded emails when changing tabs
    setExpandedEmails({})
    setReplyingTo(null)
    setActiveTab(value)
  }

  const handleQueryDatabase = (e: React.FormEvent) => {
    e.preventDefault()
    setIsQuerying(true)

    // Simulate API call
    setTimeout(() => {
      // Mock database results
      setQueryResults({
        database_id: databaseId,
        items: [
          { id: "item1", name: "Project Alpha", status: "In Progress", owner: "John Doe", created_at: "2023-04-15" },
          { id: "item2", name: "Project Beta", status: "Completed", owner: "Jane Smith", created_at: "2023-03-22" },
          { id: "item3", name: "Project Gamma", status: "Planning", owner: "Alex Johnson", created_at: "2023-04-28" },
        ],
        filter_applied: filterParams ? JSON.parse(filterParams) : "None",
      })
      setIsQuerying(false)
    }, 1500)
  }

  const handleGenerateSummary = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingSummary(true)

    // Simulate API call to LLM
    setTimeout(() => {
      // Mock summary
      setSummary(`Database ${summaryDatabaseId} contains 3 projects with the following distribution:
    
    - 1 project in Planning stage (33%)
    - 1 project In Progress (33%)
    - 1 project Completed (33%)
    
    The most active project owner is John Doe with 1 active project. All projects were created in Q1 and Q2 of 2023, with the most recent being Project Gamma (created on April 28, 2023).
    
    Key action items:
    1. Follow up on Project Alpha which is still in progress
    2. Begin resource allocation for Project Gamma which is in planning
    3. Review completed Project Beta for lessons learned`)

      setIsGeneratingSummary(false)
    }, 2000)
  }

  const renderEmailList = (emails: Email[], category: string) => {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {emails.map((email) => (
          <motion.div
            key={`${category}-${email.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEmail(`${category}-${email.id}`)
                }}
              >
                <div>
                  <p className="font-medium text-white">{email.sender}</p>
                  <p className="text-gray-400">{email.subject}</p>
                </div>
                <ChevronDown
                  className={`text-gray-400 transition-transform duration-300 ${expandedEmails[`${category}-${email.id}`] ? "rotate-180" : ""}`}
                />
              </div>

              <AnimatePresence>
                {expandedEmails[`${category}-${email.id}`] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="mt-4 pt-4 border-t border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-gray-300 mb-4">{email.body}</p>

                    {replyingTo === email.message_id ? (
                      <div className="mt-4 space-y-3">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Type your reply here..."
                          className="bg-gray-800 border-gray-700 focus-visible:ring-violet-500 min-h-24"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendReply(email.message_id)
                            }}
                            className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                            disabled={!replyContent.trim()}
                          >
                            Send Reply
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReplyingTo(null)
                            }}
                            className="border-gray-700 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setReplyingTo(email.message_id)
                        }}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        Reply
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-cyan-400/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
          </motion.div>
        ))}
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
          Email Trackout
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Manage different types of startup communications efficiently with our intelligent email tracking system.
          Organize your leads, customer queries, and internal communications in one place.
        </p>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Alert className="bg-gradient-to-r from-violet-500/10 to-cyan-400/10 border border-cyan-500/30">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 mr-2" />
              <AlertDescription className="text-cyan-100">{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger
              value="leads"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Leads
            </TabsTrigger>
            <TabsTrigger
              value="user_query"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Customer Queries
            </TabsTrigger>
            <TabsTrigger
              value="internal"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Internal Emails
            </TabsTrigger>
            <TabsTrigger
              value="query_database"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Query Database
            </TabsTrigger>
            <TabsTrigger
              value="summarize"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              Summarize
            </TabsTrigger>
          </TabsList>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "leads" && (
                <motion.div
                  key="leads"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {renderEmailList(mockEmails.leads, "leads")}
                </motion.div>
              )}

              {activeTab === "user_query" && (
                <motion.div
                  key="user_query"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {renderEmailList(mockEmails.user_query, "user_query")}
                </motion.div>
              )}

              {activeTab === "internal" && (
                <motion.div
                  key="internal"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {renderEmailList(mockEmails.internal, "internal")}
                </motion.div>
              )}
            </AnimatePresence>
            {activeTab === "query_database" && (
              <motion.div
                key="query_database"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <div className="space-y-6">
                  <form className="space-y-4" onSubmit={handleQueryDatabase}>
                    <div className="space-y-2">
                      <Label htmlFor="database-id">Database ID</Label>
                      <Input
                        id="database-id"
                        value={databaseId}
                        onChange={(e) => setDatabaseId(e.target.value)}
                        placeholder="Enter database ID"
                        className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filter-params">Filter Parameters (Optional)</Label>
                      <Textarea
                        id="filter-params"
                        value={filterParams}
                        onChange={(e) => setFilterParams(e.target.value)}
                        placeholder="Enter filter parameters in JSON format"
                        className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500 min-h-24"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                      disabled={isQuerying}
                    >
                      {isQuerying ? "Querying..." : "Query Database"}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Query Results</h3>
                    <div className="p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg">
                      {queryResults ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              Database ID: <span className="text-white">{queryResults.database_id}</span>
                            </span>
                            <span className="text-sm text-gray-400">
                              Filter:{" "}
                              <span className="text-white">
                                {typeof queryResults.filter_applied === "object"
                                  ? JSON.stringify(queryResults.filter_applied)
                                  : queryResults.filter_applied}
                              </span>
                            </span>
                          </div>

                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-gray-800">
                                <th className="text-left py-2 px-2 text-gray-400">ID</th>
                                <th className="text-left py-2 px-2 text-gray-400">Name</th>
                                <th className="text-left py-2 px-2 text-gray-400">Status</th>
                                <th className="text-left py-2 px-2 text-gray-400">Owner</th>
                                <th className="text-left py-2 px-2 text-gray-400">Created</th>
                              </tr>
                            </thead>
                            <tbody>
                              {queryResults.items.map((item: any) => (
                                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-900">
                                  <td className="py-2 px-2 text-sm">{item.id}</td>
                                  <td className="py-2 px-2 text-sm">{item.name}</td>
                                  <td className="py-2 px-2 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        item.status === "Completed"
                                          ? "bg-green-500/20 text-green-400"
                                          : item.status === "In Progress"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-amber-500/20 text-amber-400"
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-sm">{item.owner}</td>
                                  <td className="py-2 px-2 text-sm text-gray-400">{item.created_at}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">
                          No results to display. Submit a query to see data.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "summarize" && (
              <motion.div
                key="summarize"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <div className="space-y-6">
                  <form className="space-y-4" onSubmit={handleGenerateSummary}>
                    <div className="space-y-2">
                      <Label htmlFor="summary-database-id">Database ID</Label>
                      <Input
                        id="summary-database-id"
                        value={summaryDatabaseId}
                        onChange={(e) => setSummaryDatabaseId(e.target.value)}
                        placeholder="Enter database ID to summarize"
                        className="bg-gray-900 border-gray-800 focus-visible:ring-violet-500"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-violet-600 to-cyan-400 text-white hover:opacity-90 transition-opacity"
                      disabled={isGeneratingSummary}
                    >
                      {isGeneratingSummary ? "Generating..." : "Generate Summary"}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Summary</h3>
                    <div className="p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg">
                      {summary ? (
                        <div className="whitespace-pre-line text-gray-300">{summary}</div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">
                          No summary available. Submit a database ID to generate a summary.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}

