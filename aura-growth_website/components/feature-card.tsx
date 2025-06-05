"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  link: string
}

export default function FeatureCard({ icon, title, description, link }: FeatureCardProps) {
  return (
    <motion.div
      className="relative p-6 rounded-xl overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-50 rounded-xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      <div className="absolute inset-0 border border-gray-800 rounded-xl" />
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-cyan-400/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="mb-4 p-3 rounded-lg bg-gray-800 w-fit">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <Link href={link} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
          Learn more <ArrowRight className="ml-2 size-4" />
        </Link>
      </div>
    </motion.div>
  )
}

