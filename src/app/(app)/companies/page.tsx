"use client";
import { useState } from "react";
import { CompanyList } from "@/modules/companies";
import { LeadsTable } from "@/modules/leads/components/LeadsTable";
import { motion } from "framer-motion";
import { Building2, Crosshair } from "lucide-react";

const TABS = [
  { id: "manual", label: "Uploaded Leads", icon: Building2 },
  { id: "scraped", label: "Scraped Leads", icon: Crosshair },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("manual");

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-6 pt-4 border-b border-midnight-border bg-midnight-surface/30">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all cursor-pointer ${
                isActive
                  ? "text-midnight-primary bg-midnight-bg"
                  : "text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-midnight-primary rounded-t-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "manual" && <CompanyList />}
        {activeTab === "scraped" && <LeadsTable />}
      </div>
    </div>
  );
}
