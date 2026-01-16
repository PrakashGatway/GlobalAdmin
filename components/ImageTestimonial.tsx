"use client";

import { useEffect, useRef } from "react";

export default function ImageTestimonial() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const AUTO_SLIDE_INTERVAL = 3000;

  useEffect(() => {
    const keenSlider = async () => {
      const KeenSlider = (await import('keen-slider')).default;

      if (sliderRef.current) {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        let mouseOver = false;

        const slider = new KeenSlider(
          sliderRef.current,
          {
            loop: true,
            mode: 'free-snap',
            slides: {
              origin: 'center',
              perView: 1,
              spacing: 20,
            },
            breakpoints: {
              '(min-width: 640px)': {
                slides: {
                  perView: 1.5,
                  spacing: 24,
                },
              },
              '(min-width: 1024px)': {
                slides: {
                  perView: 3,
                  spacing: 32,
                },
              },
            },
          },
          [
            (slider) => {
              function clearNextTimeout() {
                if (timeout) {
                  clearTimeout(timeout);
                  timeout = null;
                }
              }

              function nextTimeout() {
                clearNextTimeout();
                if (mouseOver) return;

                timeout = setTimeout(() => {
                  slider.next();
                  nextTimeout(); // Continue auto-sliding after each slide
                }, AUTO_SLIDE_INTERVAL);
              }

              slider.on("created", () => {
                nextTimeout(); // Start auto-sliding

                slider.container.addEventListener("mouseover", () => {
                  mouseOver = true;
                  clearNextTimeout();
                });

                slider.container.addEventListener("mouseout", () => {
                  mouseOver = false;
                  nextTimeout();
                });
              });

              slider.on("dragStarted", clearNextTimeout);

              slider.on("animationEnded", () => {
                nextTimeout(); // Continue after animation ends
              });

              slider.on("updated", () => {
                if (!mouseOver) {
                  nextTimeout();
                }
              });
            },
          ]
        );

        return () => {
          if (timeout) {
            clearTimeout(timeout);
          }
          slider.destroy();
        };
      }
    };

    keenSlider();
  }, []);


  const testimonials = [
    {
      id: 1,
      name: "Aditya Sharma",
      text: "One of our proud alumni, has successfully completed his Bachelor's degree in Germany",
      university: "Harvard",
      image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600"
    },
    {
      id: 2,
      name: "Rohan Gupta",
      text: "One of our proud alumni, has successfully completed his Bachelor's degree in Germany",
      university: "Harvard",
      image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600"
    },
    {
      id: 3,
      name: "Saumya Sharma",
      text: "One of our proud alumni, has successfully completed his Bachelor's degree in Germany",
      university: "Harvard",
      image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600"
    }
  ];

  return (
    <section className="py-12" style={{ backgroundColor: '#FCEEEB', overflow: 'visible' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
        <h2 className="text-[2.6rem] font-bold text-center mb-0">
          <span style={{ color: '#f46c44' }}>Image</span>{" "}
          <span className="text-gray-600">Testimonials</span>
        </h2>

        <div ref={sliderRef} className="keen-slider">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="keen-slider__slide">
              <div className="flex items-center justify-center h-full mt-6 py-1">
                <div className="relative w-[410px] h-[350px] ">
                  <div style={{ backgroundImage: "url('/shapes/testi.png')" }} className="absolute left-1 top-1 right-1 w-full h-[97%] bg-contain bg-center bg-no-repeat" />
                  <div className="absolute top-3 left-0 w-full flex flex-col gap-2 h-full py-12 pl-8 pr-6 ">
                    <div className="grid grid-cols-2">
                      <div className="">
                        <h3 className="text-lg font-bold text-gray-600 mb-3">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-gray-700 mb-2">
                          {testimonial.text}
                        </p>
                      </div>
                      <div className="">
                      <svg viewBox="70 0 260 200" className="w-full h-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                        <defs>
                          <clipPath id="tiltedCl">
                            <path d="M 120 26 Q 93 29 91 56 L 92 125 Q 91 150 120 158 L 266 190 Q 306 194 303 155 L 303 45 Q 303 7 266 7 L 221 12 Z" />
                          </clipPath>
                        </defs>
                        <image
                          href="https://t3.ftcdn.net/jpg/06/50/56/80/360_F_650568058_q6KruAvlT4w7RahAGwIwgIY8ZjIkGAYg.jpg"
                          x="70" y="0" width={"100%"} height={"100%"}
                          clipPath="url(#tiltedCl)"
                          preserveAspectRatio="xMidYMid slice"
                        />
                        <path d="M 120 26 Q 93 29 91 56 L 92 125 Q 91 150 120 158 L 266 190 Q 306 194 303 155 L 303 45 Q 303 7 266 7 L 221 12 Z"
                          fill="none"
                          stroke="#f46c44"
                          strokeWidth="1" />
                      </svg>
                      </div>

                      {/* <div style={{ perspective: '500px' }} className="col-span-9" >
                        <div className="border border-gray-400 rounded-2xl overflow-hidden" style={{
                          transform: `
          rotateY(-20deg)
          rotateX(10deg)
          rotateZ(2deg)
          skewX(5deg)
          skewY(5deg)
        `,
                        }}>
                          <img className="scale-112 object-cover h-28 w-full" style={{
                            transform: `
          rotateY(0deg)
          rotateX(-10deg)
          rotateZ(-2deg)
          skewX(0deg)
        `,
                          }} src="https://t3.ftcdn.net/jpg/06/50/56/80/360_F_650568058_q6KruAvlT4w7RahAGwIwgIY8ZjIkGAYg.jpg" alt="" />
                        </div>
                      </div> */}
                    </div>
                    <div className="p-4">
                      <img src="https://www.gatewayabroadeducations.com/anime/p17.svg" className="h-full w-50 object-contain" alt="" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
