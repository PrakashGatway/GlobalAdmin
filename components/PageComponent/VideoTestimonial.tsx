'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    title: 'Ivy League',
    text: `My Ivy League admit was made possible by gaway global's extensive admissions counselling support with my applications. Moreover, their online portal combined with expert faculty helped me ace the SAT.`,
    videoId: 'aJTjHXbOlFI',
  },
  {
    title: 'Top US University',
    text: `With personalized mentoring and constant guidance, I secured admission into my dream university abroad.`,
    videoId: 'aJTjHXbOlFI',
  },
];

export default function VideoTestimonialsSlider() {
  const [index, setIndex] = useState(0);

  const next = () =>
    setIndex((i) => (i + 1) % testimonials.length);

  const prev = () =>
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  const item = testimonials[index];

  return (
    <section
      className="bg-cover bg-center"
      style={{
        backgroundImage: "url('/shapes/bg01.jpg')",
        backgroundColor: '#ffeae5',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-[2.6rem] font-bold text-center mb-4">
          <span className="text-[#f46c44]">Video</span>{' '}
          <span className="text-gray-600">Testimonials</span>
        </h2>

        <div className="h-[85vh] mx-auto relative overflow-hidden">
          {/* Background Shape */}
          <div
            style={{ backgroundImage: "url('/shapes/vbg.png')" }}
            className="absolute z-0 top-0 left-0 w-full h-full bg-contain bg-center bg-no-repeat"
          />

          {/* FADE SLIDE */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <div className="h-[72%] w-[48%] absolute top-[16%] left-[13%] z-1">
                <div className="relative w-full h-full">
                  {/* SVG Clip Path */}
                  <svg width="0" height="0" aria-hidden>
                    <defs>
                      <clipPath id="video-shape" clipPathUnits="objectBoundingBox">
                        <path
                          d="
              M0.06 0.09
              Q0.03 0.10 0.03 0.16
              L0.03 0.84
              Q0.03 0.94 0.07 0.95
              L0.93 0.95
              Q0.97 0.94 0.97 0.85
              L0.94 0.17
              Q0.93 0.11 0.86 0.11
              L0.13 0.09
              Z
            "
                        />
                      </clipPath>
                    </defs>
                  </svg>

                  {/* Video Container */}
                  <div
                    className="w-full h-full p-4 overflow-hidden"
                    style={{
                      clipPath: "url(#video-shape)",
                      WebkitClipPath: "url(#video-shape)",
                    }}
                  >
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="YouTube video"
                      frameBorder="0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <svg
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none -z-1"
                  >
                    <path
                      d="M0.06 0.09
              Q0.03 0.10 0.03 0.16
              L0.03 0.84
              Q0.03 0.94 0.07 0.95
              L0.93 0.95
              Q0.97 0.94 0.97 0.85
              L0.94 0.17
              Q0.93 0.11 0.86 0.11
              L0.13 0.09
              Z"
                      fill="none"
                      stroke="#FFA88F"
                      strokeWidth="40"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                {/* <iframe
                  className="h-full w-full rounded-lg"
                  src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                /> */}
              </div>

              {/* CARD SHAPE */}
              <div
                style={{ backgroundImage: "url('/shapes/vcard.png')" }}
                className="absolute top-[15%] right-[19%] z-10 w-[24%] h-full bg-contain bg-center bg-no-repeat"
              />

              {/* TEXT */}
              <div className="absolute top-[45%] right-[21%] z-10 w-[19%] text-sm text-center">
                <p className="text-3xl font-medium mb-1 text-yellow-500">
                  {item.title}
                </p>
                <p className="text-white">
                  {item.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* NAVIGATION */}
          <div className="absolute bottom-6 right-[12%] text-lg flex gap-3 z-50">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-[#f46c44]/50 flex items-center justify-center text-white"
            >
              ←
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-[#f46c44]/50 flex items-center justify-center text-white"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
