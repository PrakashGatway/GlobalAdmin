"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BadgeIcon, Globe, NutOffIcon, PanelsTopLeftIcon, TargetIcon, Users, VideoIcon, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import UniversitySliderClient from "@/components/PageComponent/Unversity"
import AboutTabsSection from "@/components/PageComponent/TrustTabs"
import VideoTestimonialsSlider from "@/components/PageComponent/VideoTestimonial"
import ImageTestimonial from "@/components/ImageTestimonial"
import VideoInSvgShape from "@/components/PageComponent/VideoShape"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
}

function TimelineItem({
  top,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  icon,
}: {
  top: boolean;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative text-center">
      <div className="absolute -top-21 left-1/2 -translate-x-1/2 w-[4px] h-[70%] bg-[#6b7280]" />
      <div className={top ? "mt-10" : ""}>
        <div className="relative z-10 w-20 h-20 mx-auto mb-2 rounded-full border-[2px] border-[#f46c44] bg-white flex items-center justify-center">
          {icon}
        </div>
        <h3
          className="text-2xl font-bold leading-tight"
          style={{ color: titleColor }}
        >
          {title}
        </h3>
        <p
          className="text-xl leading-tight"
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <main className="">
      <section
        className="
        relative overflow-hidden
        bg-white
        bg-[url('/images/hero.jpg')]
        bg-no-repeat bg-cover bg-bottom"
      >
        <div className="absolute inset-0 bg-white/40 md:bg-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-2">
            <div className="">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight">
                <span className="block text-[#646162]">
                  Your Gateway to the World&apos;s
                </span>

                <span className="relative inline-block mt-3 text-[#ea6c46]">
                  Top Universities
                  <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-[#f46c44]">
                    <span className="absolute right-0 -top-[3px] w-2 h-2 rounded-full bg-[#f46c44]" />
                  </span>
                </span>
              </h1>

              <p className="mt-6 text-sm sm:text-base lg:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0">
                Specialized admissions guidance for{" "}
                <span className="font-semibold text-[#f46c44]">
                  Ivy League, Russell Group, German & Italian Public Universities
                </span>
              </p>

              {/* CTA BUTTONS */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ backgroundColor: '#f46c44', transform: 'perspective(1000px) rotateY(12deg)', transformStyle: 'preserve-3d', borderRadius: '16px' }}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Get Free Counselling
                </button>
                <button className="text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-semibold hover:bg-black transition-all" style={{ backgroundColor: '#1f2937', transform: 'perspective(1000px) rotateY(15deg)', transformStyle: 'preserve-3d', borderRadius: '16px' }}>
                  Check Your Eligibility
                </button>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="flex justify-center item-center h-full">
              <Image
                src="/images/logo-design.png"
                alt="Graduation Cap Illustration"
                width={550}
                height={450}
                className="object-cover"
              />
            </div>
          </div>

          {/* STATS SECTION */}
          <div className="pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { value: "97%", title: "Application Acceptance", sub: "in Public Universities" },
                { value: "#1", title: "Consultancy for", sub: "Top-Tier Programs" },
                { value: "5000+", title: "Successful", sub: "Student Applications" },
                { value: "15+", title: "Years of", sub: "Expert Experience" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Image
                    src="https://toppng.com/uploads/preview/graduation-cap-svg-icon-free-graduation-cap-icon-11553393846gq7rcr1qsx.png"
                    alt="Graduation Cap Illustration"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                  <div>
                    <div className="text-4xl font-bold text-gray-800">
                      {item.value}
                    </div>
                    <div className="text-gray-700 leading-snug">
                      <div>{item.title}</div>
                      <div>{item.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <UniversitySliderClient />

      <section
        className="
    relative py-20 overflow-hidden
    bg-[url('/shapes/bg-02.jpg')]
    bg-cover bg-center bg-no-repeat
  "
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <h2 className="text-[2.6rem] font-bold text-center mb-12">
            <span className="text-[#ea6c46]">Why</span>{" "}
            <span className="text-[#646162]">GAway Global ?</span>
          </h2>

          {/* Timeline Wrapper */}
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#f46c44]">
              <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f46c44] rounded-full" />
              <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f46c44] rounded-full" />
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-24">

              {/* ITEM 1 */}
              <TimelineItem

                title="Specialized ONLY"
                subtitle="in elite admissions"
                titleColor="#646162"
                subtitleColor="#ea6c46"
                icon={
                  <TargetIcon className="h-10 w-10 text-[#646162]" />
                }
              />

              {/* ITEM 2 */}
              <TimelineItem
                top={true}
                title="10+ yrs"
                subtitle="experience"
                titleColor="#ea6c46"
                subtitleColor="#646162"
                icon={
                  <BadgeIcon className="h-10 w-10 text-[#646162]" />
                }
              />

              {/* ITEM 3 */}
              <TimelineItem
                title="Transparent process"
                subtitle="(No hidden fees)"
                titleColor="#ea6c46"
                subtitleColor="#646162"
                icon={
                  <NutOffIcon className="h-10 w-10 text-[#646162]" />
                }
              />

              {/* ITEM 4 */}
              <TimelineItem
                top={true}
                title="Country-specific"
                subtitle="experts"
                titleColor="#646162"
                subtitleColor="#ea6c46"
                icon={
                  <PanelsTopLeftIcon className="h-10 w-10 text-[#646162]" />
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 overflow-hidden w-full 
      bg-[url('/shapes/bg01.jpg')]
      bg-cover
      bg-center
      bg-no-repeat relative" >
        <div className="max-w-7xl mx-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 ml-8 relative z-10
        ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center w-full min-h-[500px">
              <div className="relative w-full h-full sm:min-h-[550px] min-h-[400px] ">
                <div
                  className="left-0 top-0 w-full hover:z-20 transition-all duration-500 ease-in-out"
                  style={{ perspective: '500px' }}
                >
                  {/* IMAGE CARD */}
                  <div
                    className="
        sm:w-75 sm:h-95 w-50 h-60
        rounded-4xl
        overflow-hidden
        border-[2px] border-orange-500
        bg-white hover:z-20
        cursor-pointer
        transition-all duration-500 ease-out
        hover:scale-[1.01]
        hover:shadow-2xl
      "
                    style={{
                      transform: `
          rotateY(12deg)
          rotateX(5deg)
          rotateZ(4deg)
          skewX(6deg)
        `,
                    }}
                  >
                    <img
                      src="https://http2.mlstatic.com/D_NQ_NP_639205-CBT99685072123_112025-O.webp"
                      alt=""
                      className="w-full h-full object-cover scale-110"
                      style={{
                        transform: `
          rotateY(-12deg)
          rotateX(5deg)
          rotateZ(-5deg)
          skewX(-5deg)
        `,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="absolute left-30 bottom-0 w-full"
                  style={{ perspective: '500px' }}
                >
                  {/* IMAGE CARD */}
                  <div
                    className="
        sm:w-80 sm:h-95 w-50 h-60
        rounded-4xl
        overflow-hidden
        border-[2px] border-orange-500
        bg-white
        z-20
        cursor-pointer
        transition-all duration-500 ease-out
        hover:scale-[1.01]
        hover:shadow-2xl
      "
                    style={{
                      transform: `
          rotateY(-10deg)
          rotateX(5deg)
          rotateZ(-5deg)
          skewX(-5deg)
        `,
                    }}
                  >
                    <img
                      src="https://img.freepik.com/fotos-premium/uma-garota-universitaria-sorrindo-com-passaporte-e-carta-de-aceitacao-para-estudar-no-exterior-visto-de-estudante_1317017-1759.jpg?semt=ais_hybrid&w=740&q=80"
                      alt=""
                      className="w-full h-full object-cover scale-115 "
                      style={{
                        perspective: '500px',
                        transform: `
       rotateY(5deg)
          rotateX(15deg)
          rotateZ(8deg)
          skewX(8deg)
        `,
                      }}
                    />
                  </div>

                  {/* EXPERIENCE BADGE */}
                  <div className="
      absolute bottom-30 -left-10
      z-40
      w-30 h-30
      rounded-full
      bg-white
      border-[3px] border-orange-600
      shadow-2xl
      flex flex-col items-center justify-center
    ">
                    <span className="text-4xl font-bold text-orange-500">15</span>
                    <span className="text-xs text-orange-500 text-center leading-tight font-semibold">
                      Years of<br />Experience
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-[2.6rem] font-bold leading-tight mb-3">
                  <span style={{ color: '#ea6c46' }}>Your Trusted Partner in</span>
                  <br />
                  <span className="text-[#646162]">Immigration Services</span>
                </h2>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We provide reliable guidance for study, work, and permanent residency
                  applications. Our experienced team supports you at every step of your
                  immigration journey.
                </p>

                <AboutTabsSection />


                {/* CTA Buttons */}
                <div className="mt-2 flex gap-4 items-center">
                  <button className="text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all hover:opacity-90" style={{ backgroundColor: '#f46c44' }}>
                    About Us
                  </button>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      <VideoTestimonialsSlider />
      <ImageTestimonial />
      <section className="py-18 overflow-hidden" style={{ backgroundColor: '#ffece5' }}>
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">

          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-[2.6rem] font-bold mb-2">
              <span style={{ color: '#f46c44' }}>Top Universities</span>{" "}
              <span className="text-gray-600">Hub</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Explore globally recognized university groups across major study destinations,
              carefully curated for ambitious international students.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">

            <div className="text-center group">
              <div className="relative mx-auto w-full max-w-[280px] mb-6">
                <svg viewBox="0 0 300 200" className="w-full h-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                  <defs>
                    <clipPath id="tiltedClip1">
                      <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z" />
                    </clipPath>
                  </defs>
                  <image
                    href="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop"
                    x="0" y="0" width="300" height="200"
                    clipPath="url(#tiltedClip1)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z"
                    fill="none"
                    stroke="#f46c44"
                    strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Ivy League Universities
              </h3>
              <p className="text-sm font-medium" style={{ color: '#f46c44' }}>
                America&apos;s most prestigious institutions
              </p>
            </div>

            {/* Russell Group */}
            <div className="text-center group">
              <div className="relative mx-auto w-full max-w-[280px] mb-6">
                <svg viewBox="0 0 300 200" className="w-full h-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                  <defs>
                    <clipPath id="tiltedClip2">
                      <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z" />
                    </clipPath>
                  </defs>
                  <image
                    href="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop"
                    x="0" y="0" width="300" height="200"
                    clipPath="url(#tiltedClip2)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z"
                    fill="none"
                    stroke="#f46c44"
                    strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Russell Group Universities
              </h3>
              <p className="text-sm font-medium" style={{ color: '#f46c44' }}>
                Leading UK research universities
              </p>
            </div>

            {/* TU9 */}
            <div className="text-center group">
              <div className="relative mx-auto w-full max-w-[280px] mb-6">
                <svg viewBox="0 0 300 200" className="w-full h-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                  <defs>
                    <clipPath id="tiltedClip3">
                      <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z" />
                    </clipPath>
                  </defs>
                  <image
                    href="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop"
                    x="0" y="0" width="300" height="200"
                    clipPath="url(#tiltedClip3)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z"
                    fill="none"
                    stroke="#f46c44"
                    strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                TU9 & Public Universities
              </h3>
              <p className="text-sm font-medium" style={{ color: '#f46c44' }}>
                Germany&apos;s top technical institutions
              </p>
            </div>

            {/* Italian Public */}
            <div className="text-center group">
              <div className="relative mx-auto w-full max-w-[280px] mb-6">
                <svg viewBox="0 0 300 200" className="w-full h-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                  <defs>
                    <clipPath id="tiltedClip4">
                      <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z" />
                    </clipPath>
                  </defs>
                  <image
                    href="https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=300&fit=crop"
                    x="0" y="0" width="300" height="200"
                    clipPath="url(#tiltedClip4)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 16 190 81 195 L 251 196 Q 289 187 287 153 L 277 74 Q 271 40 233 32 L 72 10 Z"
                    fill="none"
                    stroke="#f46c44"
                    strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Italian Public Universities
              </h3>
              <p className="text-sm font-medium" style={{ color: '#f46c44' }}>
                Affordable education with global value
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-[#f3f3f3] to-white bg-[url('/bg-01.jpg')] bg-cover bg-center bg-no-repeat relative">
        <div className="max-w-7xl mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-[2.6rem] font-bold">
              <span style={{ color: '#f46c44' }}>GA way</span>{" "}
              <span className="text-gray-600">global Blogs</span>
            </h2>
            <p className="mt-1 text-gray-600 max-w-3xl mx-auto">
              Smart insights, expert guidance, and real updates to help you plan your
              study abroad journey with confidence.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-20">
            {[
              {
                icon: "💡",
                tag: "10 Essential",
                title: "Study Abroad Tips",
                img: "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/396e9/MainBefore.jpg",
              },
              {
                icon: "🎓",
                tag: "Top 10",
                title: "Scholarships for Indian Students",
                img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop",
              },
              {
                icon: "📘",
                tag: "Complete Guide to",
                title: "Admissions Success",
                img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop",
              },
            ].map((card, i) => (
              <div key={i} className="text-center group">
                <div className="relative mx-auto w-full mb-2">
                  <svg viewBox="0 0 305 200" className="w-full h-auto">
                    <defs>
                      <clipPath id="blogclip">
                        <path d="M 71 10 Q 20 8 15 55 L 16 137 Q 15 195 80 196 L 273 197 Q 306 194 303 155 L 292 60 Q 284 21 247 20 L 72 10 Z" />
                      </clipPath>
                    </defs>
                    <image
                      href={card.img}
                      x="-0"
                      y="-0"
                      width={"100%"}
                      height={"100%"}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath="url(#blogclip)"
                    />
                    <path
                      d="M 71 10 Q 20 8 15 55 L 16 137 Q 15 195 80 196 L 273 197 Q 306 194 303 155 L 292 60 Q 284 21 247 20 L 72 10 Z"
                      fill="none"
                      stroke="#f46c44"
                      strokeWidth="1"
                    />
                  </svg>


                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Preparing for TOEFL Speaking Scoring section: Key Skills and Practice
                </h3>
                <p className="text-sm font-medium" style={{ color: '#f46c44' }}>
                  Particularly for non-native English speakers, the TOEFL 
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>
    </main>
  )
}
