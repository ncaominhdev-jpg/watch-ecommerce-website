'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

const CategorySection = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const filtered = data.filter(cat => cat.status === true);
                    setCategories(filtered);
                }
            })
            .catch(err => console.error('Lỗi khi lấy danh mục:', err));
    }, []);

    return (
        <section className="flex w-10/12 !mx-auto !py-7 gap-2">
            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={16}
                slidesPerView={categories.length < 3 ? categories.length : 3}
                loop={categories.length > 3}
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                className="w-full"
            >
                {categories.map((cat, idx) => (
                    <SwiperSlide key={idx}>
                        <Link  href={`/san-pham?category=${cat.slug}`} className="block">
                            <div className="w-full h-[220px] relative rounded-xl overflow-hidden shadow-xl hover:shadow-lg transition-all duration-300 group">
                                <img
                                    src={cat.image || '/default-category.jpg'}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-120"
                                />

                                {/* Overlay tên danh mục */}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <h2
                                        className="text-white text-4xl text-center px-2 tracking-tight font-light" >
                                        {cat.name}
                                    </h2>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>

    );
};

export default CategorySection;
