'use client';
import React, { useState, useRef, useEffect } from 'react';

import HeroSection from './HeroSection/HeroSection';
import CategorySection from './CategorySection/CategorySection';
import BrandSection from './BrandSection/BrandSection';
import FlashSaleSection from './FlashSaleSection/FlashSaleSection';
import ProductSection from './ProductSection/ProductSection';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

const slidesData = {
  slider2: [
    "/image/category/1bdca5d0dd3ce9c02ee514d9039b07bc.jpg",
    "/image/category/2d1728b12060798c1236ddc0da830393.jpg",
    "/image/category/d47b82ec6b0ad4b045d7de38bf0e9c9b.jpg",
    "/image/category/0077c108e69ea8461cd43f9c40005ceb.jpg",
    "/image/category/34547b7a64a3b8f95b2bd7cdf9f234e4.jpg",
  ],
};

function Home() {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    { id: 1, image: '/image/main/slide1.webp', alt: 'Đồng hồ 1' },
    { id: 2, image: '/image/main/slide2.webp', alt: 'Đồng hồ 2' },
    { id: 3, image: '/image/main/slide3.webp', alt: 'Đồng hồ 3' },
    { id: 4, image: '/image/main/slide4.webp', alt: 'Đồng hồ 4' }
  ];

  useEffect(() => {
    console.log('Slides in useEffect:', slides);
    if (!Array.isArray(slides) || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (newIndex) => {
    if (isTransitioning || !slides.length) return;

    setIsTransitioning(true);
    setCurrentSlide(newIndex);

    const timeoutId = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleThumbnailClick = (index) => {
    handleSlideChange(index);
  };


  return (
    <>
      <HeroSection />
      <main className="!mx-auto">
        <FlashSaleSection />
        <CategorySection />
        <BrandSection/>
        <ProductSection/>
      </main>
    </>
  );
}

export default Home;