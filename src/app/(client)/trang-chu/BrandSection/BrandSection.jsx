'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Mousewheel } from 'swiper/modules';
import Link from 'next/link';

function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

const BrandSection = () => {
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const [brands, setBrands] = useState([]);
    const [productImages, setProductImages] = useState([]);

    // Fetch brands
    useEffect(() => {
        fetch('/api/brands')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const filtered = data.filter(b => b.status === true);
                    setBrands(filtered);
                }
            })
            .catch(err => console.error("Lỗi khi tải brand:", err));
    }, []);

    // Fetch product images
    useEffect(() => {
        fetch('/api/products/images')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const images = data.map(item => item.image_url).filter(Boolean);
                    setProductImages(images);
                }
            })
            .catch(err => console.error("Lỗi khi tải ảnh sản phẩm:", err));
    }, []);

    // Auto slide
    useEffect(() => {
        if (productImages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex2(prev => (prev + 1) % productImages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [productImages]);

    const getGridClass = (length) => {
        if (length >= 6) return "grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2";
        if (length === 4) return "grid-cols-2 grid-rows-2";
        if (length === 2) return "grid-cols-2";
        return "grid-cols-1";
    };

    return (
        <section className="brand !w-10/12 !mx-auto py-6">
            <div className="box_title flex items-center justify-between">
                <h3 className='text-3xl'>Thương hiệu</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-start box_category">
                {/* LEFT SLIDE IMAGE */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white group h-[510px]">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        navigation={{
                            nextEl: '.custom-next',
                            prevEl: '.custom-prev'
                        }}
                        autoplay={{ delay: 2500, pauseOnMouseEnter: true, disableOnInteraction: false }}
                        loop={productImages.length > 1}
                        grabCursor={true}
                        className="w-full h-full"
                    >
                        {productImages.map((img, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img || '/default-product.jpg'}
                                    alt={`product-slide-${index}`}
                                    className="w-full h-full object-cover"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* RIGHT GRID */}
                <div className="md:w-2/3 w-full px-1">
                    <Swiper
                        modules={[Navigation, Autoplay, Mousewheel]}
                        spaceBetween={20}
                        slidesPerView={1}
                        autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        loop={chunkArray(brands, 6).filter(group => group.length % 2 === 0).length > 1}
                        grabCursor={true}
                        speed={600}
                    >
                        {chunkArray(brands, 6)
                            .map(group => {
                                // Nếu lẻ thì loại bỏ phần tử cuối → chỉ giữ số chẵn
                                if (group.length % 2 !== 0) {
                                    return group.slice(0, group.length - 1);
                                }
                                return group;
                            })
                            .filter(group => group.length > 0) // Bỏ các nhóm rỗng hoặc chỉ còn 1
                            .map((group, idx) => (
                                <SwiperSlide key={idx}>
                                    <div className={`grid gap-4 ${getGridClass(group.length)} `}>
                                        {group.map((brand, i) => (
                                            <Link
                                                key={brand.id || i}
                                                href={`/san-pham?brands=${brand.slug}`}
                                                className="block "
                                            >
                                                <div className="bg-[#1f2438] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 text-center px-3 pt-4 pb-3 flex flex-col items-center gap-y-2 group hover:shadow-2xl hover:scale-[1.02]">
                                                    <div className="w-full h-[205px] bg-white rounded-md flex items-center justify-center overflow-hidden px-2 transition-all duration-300 group-hover:scale-[1.08]">
                                                        <img
                                                            src={brand.logo_url || "/default-brand.jpg"}
                                                            alt={brand.name}
                                                            className="w-full h-full object-cover transition-transform duration-300"
                                                        />

                                                    </div>
                                                    <h2 className="text-3xl font-bold text-white truncate w-full transition-colors duration-300 group-hover:text-gray-200">
                                                        {brand.name}
                                                    </h2>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </SwiperSlide>
                            ))}
                    </Swiper>

                </div>
            </div>
        </section>
    );
};

export default BrandSection;
