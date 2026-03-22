import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const PROJECTS = [
  {
    title: "Retail Analytics",
    description: "Real-time sales trends and actionable inventory recommendations.",
  },
  {
    title: "Distributor Portal",
    description: "Unified purchase flow with status tracking and smart notifications.",
  },
  {
    title: "Automated Reorder",
    description: "Threshold-based restocking that reduces out-of-stock incidents.",
  },
  {
    title: "Revenue Dashboard",
    description: "Clean finance snapshots and exportable KPI reports.",
  },
  {
    title: "Vendor Insights",
    description: "Supplier scorecards with delivery and quality benchmarks.",
  },
  {
    title: "Promotion Engine",
    description: "Campaign planning with predicted conversion lift.",
  },
];

export function ProjectGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900  md:text-3xl">Project Highlights</h2>
        <p className="mt-2 text-slate-600 ">Reusable card UI with motion and dark mode support.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: idx * 0.06, duration: 0.35 }}
          >
            <Card className="h-full transition-transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{project.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
