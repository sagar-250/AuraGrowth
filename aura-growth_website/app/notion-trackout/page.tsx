"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Database, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function NotionTrackout() {
  const [activeTab, setActiveTab] = useState("query_database")

  const [databaseId, setDatabaseId] = useState("")
  const [filterParams, setFilterParams] = useState("")
  const [queryResults, setQueryResults] = useState<null | any>(null)
  const [isQuerying, setIsQuerying] = useState(false)

  const [summaryDatabaseId, setSummaryDatabaseId] = useState("")
  const [summary, setSummary] = useState<null | string>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 size-4" /> Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400">
          Notion Trackout
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Query and analyze your Notion databases with powerful tools. Extract insights, generate summaries, and track
          your projects efficiently.
        </p>
      </div>

      <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger
              value="query_database"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              <Database className="size-4 mr-2" />
              Query Database
            </TabsTrigger>
            <TabsTrigger
              value="summarize"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-400/20"
            >
              <FileText className="size-4 mr-2" />
              Summarize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query_database">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
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
                    <p className="text-gray-400 text-center py-8">No results to display. Submit a query to see data.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="summarize">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
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
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

