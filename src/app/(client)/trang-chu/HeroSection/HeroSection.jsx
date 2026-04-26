'use client';
import React, { useState, useEffect } from 'react';

const slides = [
  { id: 1, image: '/image/main/slide1.webp', alt: 'Đồng hồ 1' },
  { id: 2, image: '/image/main/slide2.webp', alt: 'Đồng hồ 2' },
  { id: 3, image: '/image/main/slide3.webp', alt: 'Đồng hồ 3' },
  { id: 4, image: '/image/main/slide4.webp', alt: 'Đồng hồ 4' },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleThumbnailClick = (index) => {
    handleSlideChange(index);
  };

  if (!hasMounted) return null;

  return (
    <section className="section_one !py-13 bg-[#1f1f1f] relative overflow-hidden">
      <div className="!w-10/12 !mx-auto text-white flex items-center justify-between md:px-20">
         <div className="w-full md:w-1/2 space-y-6">
          <div className="text-sm text-orange-700 tracking-widest uppercase">Bộ Sưu Tập</div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
            ĐỒNG HỒ WATCHES.<br />
            KHẲNG ĐỊNH PHONG CÁCH. LUÔN ĐÚNG GIỜ.
          </h1>
          <p className="text-base text-gray-300 max-w-md">
            Khám phá những thiết kế tinh xảo, kết hợp giữa nghệ thuật chế tác truyền thống và công nghệ hiện đại – dành riêng cho những ai trân trọng từng khoảnh khắc.
          </p>
          <button className="!mt-6 !p-2 inline-flex items-center gap-2 text-orange-700 border border-orange-700 px-6 py-2 rounded hover:bg-orange-700 hover:text-black transition duration-300 font-medium tracking-wide">
            Xem Bộ Sưu Tập
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 0 1 .7.3l5 5a1 1 0 0 1-1.4 1.4L11 6.42V17a1 1 0 1 1-2 0V6.41L5.7 9.7a1 1 0 0 1-1.4-1.4l5-5A1 1 0 0 1 10 3z" />
            </svg>
          </button>
        </div>

         <div
          className="section_one_right !mr-[10%] !h-[500px] flex justify-center items-center relative bg-cover bg-center"
          style={{
            backgroundImage: "url('/image/main/bg-banner.png')",
            backgroundSize: "80%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
          }}
        >
          <div className="relative w-[300px] h-[400px] overflow-hidden">
            {slides.map((slide, index) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.alt}
                className={`absolute inset-0 max-h-[400px] max-w-[300px] object-contain z-10 transition-all duration-500 ease-in-out transform ${
                  index === currentSlide
                    ? 'opacity-100 scale-100 translate-x-0'
                    : index < currentSlide
                      ? 'opacity-0 scale-95 -translate-x-full'
                      : 'opacity-0 scale-95 translate-x-full'
                }`}
              />
            ))}
          </div>

          <div className={`absolute inset-0 rounded-full bg-gradient-radial from-orange-700/20 to-transparent blur-xl transition-opacity duration-500 ${isTransitioning ? 'opacity-100' : 'opacity-50'}`} />
        </div>

         <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 flex flex-col items-center gap-6 text-sm z-20">
          <button
            className="hover:text-white transition transform hover:scale-110"
            onClick={() => handleSlideChange((currentSlide - 1 + slides.length) % slides.length)}
          >
            ▲
          </button>
          <div className="rotate-90 text-xs tracking-widest text-orange-700">
            {String(currentSlide + 1).padStart(2, '0')}
          </div>
          <div className="rotate-90 text-xs tracking-widest text-gray-600">
            {String(slides.length).padStart(2, '0')}
          </div>
          <button
            className="hover:text-white transition transform hover:scale-110"
            onClick={() => handleSlideChange((currentSlide + 1) % slides.length)}
          >
            ▼
          </button>
        </div>

         <div className="absolute right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                index === currentSlide
                  ? 'ring-2 ring-orange-700 ring-opacity-80 scale-105'
                  : 'hover:ring-2 hover:ring-white hover:ring-opacity-50'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={slide.image}
                alt={`Thumbnail ${index + 1}`}
                className={`max-w-[70px] h-[70px] object-cover rounded-lg transition-all duration-300 ${
                  index === currentSlide
                    ? 'opacity-100 brightness-110'
                    : 'opacity-60 hover:opacity-100'
                }`}
              />
              {index === currentSlide && (
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-orange-700 rounded-full animate-pulse"></div>
              )}
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-orange-700/20 to-transparent opacity-0 transition-opacity duration-300 ${index === currentSlide ? 'opacity-30' : 'hover:opacity-20'}`} />
            </div>
          ))}
        </div>

         <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide ? 'w-8 bg-orange-700' : 'w-4 bg-gray-600 hover:bg-gray-400'
              }`}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      </div>

       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-700/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-orange-700/3 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-orange-700/4 rounded-full animate-pulse delay-500"></div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(-100px) scale(0.9);
          }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
