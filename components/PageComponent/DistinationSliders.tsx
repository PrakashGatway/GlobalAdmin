"use client";

import { useEffect, useRef } from "react";
import KeenSlider from "keen-slider";
import "keen-slider/keen-slider.min.css";

const DATA = [
  { count: 244, text: "Offers to Cornell" },
  { count: 109, text: "Offers to Princeton" },
  { count: 187, text: "Offers to Stanford" },
  { count: 130, text: "Offers to Yale" },
  { count: 139, text: "Offers to Johns Hopkins" },
  { count: 24, text: "Offers to Caltech" },
  { count: 365, text: "Offers to UC Berkeley" },
  { count: 338, text: "Offers to UCLA" },
];

function OfferCard({ count, text }: { count: number; text: string }) {
  return (
    <div className="keen-slider__slide !w-full">
      <div className="
        flex items-center gap-2
        border-2 border-[#ff6a3d]
        text-[#ff6a3d]
        px-6 py-4
        text-base font-medium
        whitespace-nowrap
        bg-white
      ">
        <span className="font-bold text-xl">{count}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

function marquee(speed = 0.1) {
  return (slider: any) => {
    let rafId: number;
    let lastTime: number | null = null;

    function loop(time: number) {
      if (lastTime) {
        const delta = time - lastTime;
        slider.track.details.position += (speed * delta) / 15000;
        slider.track.details.position %= slider.track.details.length;
        slider.track.to(slider.track.details.position);
      }
      lastTime = time;
      rafId = requestAnimationFrame(loop);
    }

    slider.on("created", () => {
      rafId = requestAnimationFrame(loop);
    });

    slider.on("destroyed", () => {
      cancelAnimationFrame(rafId);
    });
  };
}


export default function OffersSlider() {
  const sliderRef1 = useRef<HTMLDivElement>(null);
  const sliderRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sliderRef1.current || !sliderRef2.current) return;

    const slider1 = new KeenSlider(
      sliderRef1.current,
      {
        loop: true,
        drag: true,
        renderMode: "performance",
        slides: { perView: "6", spacing: 6 },
      },
      [marquee(0.4)] // left → right
    );

    const slider2 = new KeenSlider(
      sliderRef2.current,
      {
        loop: true,
        drag: true,
        rtl: true,
        slides: { perView: "6", spacing: 6 },
      },
      [marquee(0.4)] // right → left
    );

    return () => {
      slider1.destroy();
      slider2.destroy();
    };
  }, []);

  return (
    <div className="space-y-6 py-8 overflow-hidden bg-white">
      <div ref={sliderRef1} className="keen-slider">
        {[...DATA, ...DATA].map((item, i) => (
          <OfferCard key={i} {...item} />
        ))}
      </div>

      <div ref={sliderRef2} className="keen-slider">
        {[...DATA, ...DATA].map((item, i) => (
          <OfferCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}


import React from 'react';
import Image from 'next/image';

export const IvyLeagueSection = () => {
  const cards = [
    {
      id: 1,
      title: "Ivy League Counseling",
      description: "One on One counseling with our country specialist. Shortlist your ideal destination, institution and program with their expert guidance.",
      ctaText: "Free Expert Consultation",
      ctaLink: "#"
    },
    {
      id: 2,
      title: "Profile Building",
      description: "Apply to your dream university. Our team will guide you through the application process.",
      ctaText: "Free Expert Consultation",
      ctaLink: "#"
    }
  ];

  return (
    <section 
      className="min-h-screen py-16 px-4 md:px-8 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #fffaf7 0%,  100%)'
      }}
    >
      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        <div className="w-full lg:w-1/2 relative">
        <h4 className="text-[2.6rem] text-[#f46c44] font-semibold" style={{ fontFamily: "'Mileast', 'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}>What Makes Ivy league Special</h4>
          <div className="relative perspective-1000">
            {cards.map((card, index) => (
              <div 
                key={card.id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-2xl transition-all duration-300 hover:rotate-0 hover:translate-y-[-10px] hover:shadow-3xl relative z-10"
                style={{
                  transform: `rotate(${(index - 0.5) * 2}deg) translateY(${index * 20}px)`,
                  zIndex: index === 0 ? 20 : 10
                }}
              >
                {/* Card Content */}
                <div className="relative z-20">
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    {card.description}
                  </p>
                  <a
                    href={card.ctaLink}
                    className="inline-block text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                  >
                    {card.ctaText}
                  </a>
                </div>
                
                {/* Separator */}
                {index === 0 && (
                  <div 
                    className="h-px mt-8 -mx-8"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Title on Left Side */}
          <div className="mt-12">
            <h2 
              className="text-4xl md:text-5xl font-black inline-block"
              style={{
                transform: 'rotate(-5deg)',
                background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              Ivy League Special
            </h2>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="w-full lg:w-1/2">
          <div 
            className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-3xl transition-transform duration-300 hover:rotate-0"
            style={{
              transform: 'rotate(3deg)'
            }}
          >
            {/* Placeholder Image - Replace with your actual image */}
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(45deg, #1a202c, #2d3748)'
              }}
            >
              <span className="text-white text-2xl font-semibold tracking-wider">
                University Image
              </span>
            </div>
            
            {/* If you have an actual image, use this instead:
            <Image
              src="/path-to-your-image.jpg"
              alt="Ivy League University"
              fill
              className="object-cover"
              priority
            />
            */}
          </div>
        </div>
      </div>
    </section>
  );
};
