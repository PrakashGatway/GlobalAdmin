"use client";

import { useState } from "react";
import Image from "next/image";

const TABS = [
  {
    key: "trust",
    label: "Trust",
    title: "Your Trusted Partner in Immigration Services",
    description:
      "We provide reliable guidance for study, work, and permanent residency applications. Our experienced team supports you at every step of your immigration journey.",
    points: [
      "Technology Growth",
      "Client-Focused Services",
      "Dedicated Team Members",
      "Trusted Immigration Guidance",
    ],
  },
  {
    key: "transparency",
    label: "Transparency",
    title: "Complete Transparency at Every Step",
    description:
      "No hidden processes, no hidden fees. We believe in honest communication and clarity throughout your immigration journey.",
    points: [
      "No Hidden Charges",
      "Clear Process Updates",
      "Honest Counselling",
      "Open Communication",
    ],
  },
  {
    key: "excellence",
    label: "Excellence",
    title: "Driven by Excellence & Results",
    description:
      "Our commitment to excellence ensures high success rates and world-class service standards for every client.",
    points: [
      "Proven Success Record",
      "Elite Admission Expertise",
      "High Client Satisfaction",
      "Global Recognition",
    ],
  },
];

export default function AboutTabsSection() {
  const [activeTab, setActiveTab] = useState("excellence");

  const activeData = TABS.find((t) => t.key === activeTab)!;

  return (
    <section className=" mb-6">
      <div className="">

        {/* Tabs Header */}
        <div className="relative mb-8">
          {/* Line */}
          <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#f46c44]/40" />
          <div className="flex gap-4 relative z-10 max-w-xl mx-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all
                  ${
                    activeTab === tab.key
                      ? "bg-[#f46c44] text-white shadow-md"
                      : "bg-white text-gray-500"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Content */}
        <div className="flex gap-6 items-center">
          
          {/* Left Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl max-w-sm">
              <Image
                src="https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg"
                alt="Team Discussion"
                width={230}
                height={250}
                className="object-cover"
              />
            </div>
          </div>

          <div>

            <ul className="space-y-2">
              {activeData.points.map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                  <span className="text-[#f46c44] text-lg ">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
