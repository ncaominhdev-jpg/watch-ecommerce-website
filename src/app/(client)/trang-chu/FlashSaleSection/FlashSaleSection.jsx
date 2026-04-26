'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from '../../../../components/ProductCardHome';

const FlashSaleSection = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();

                const filtered = data
                    .filter((product) => product.status === true)
                    .map((product) => {
                        const images = product.product_images || [];

                        const discountedVariants = (product.product_variants || []).filter(
                            (v) => v.status === true && v.discount && v.discount > 0
                        );

                        if (discountedVariants.length === 0) return null;

                        const salePrices = discountedVariants.map(
                            (v) => v.price - (v.discount || 0)
                        );

                        const minSalePrice = Math.min(...salePrices);
                        const maxSalePrice = Math.max(...salePrices);
                        const originalPrice = product.price;

                        const discountPercent =
                            originalPrice && minSalePrice < originalPrice
                                ? `-${Math.round(((originalPrice - minSalePrice) / originalPrice) * 100)}%`
                                : null;

                        return {
                            ...product,
                            image1: images[0]?.image_url || '/placeholder.jpg',
                            image2: images[1]?.image_url || images[0]?.image_url || '/placeholder.jpg',
                            salePriceMin: minSalePrice,
                            salePriceMax: maxSalePrice,
                            originalPrice,
                            discountPercent,
                            onSale: true,
                        };
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.salePriceMin - b.salePriceMin) // Sắp xếp theo giá sale tăng dần
                    .slice(0, 15); // Chỉ lấy 15 sản phẩm đầu

                setProducts(filtered);
            } catch (err) {
                console.error('Lỗi khi gọi API sản phẩm:', err);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flash !border-0">
            <div className="box_title flex items-center text-center justify-center !p-3">
                <h3 className="text-3xl font-bold !text-[#1F2438]">Khuyến Mãi Đặc Biệt</h3>
            </div>

            <div className="relative w-10/12 !py-2 !mx-auto">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={10}
                    // navigation={true} 
                    autoplay={{
                        delay: 2500,
                        pauseOnMouseEnter: true,
                        disableOnInteraction: false,
                    }}
                    grabCursor={true}
                    loop={products.length > 4}
                    className="product-swiper !py-2"
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 4 },
                        1024: { slidesPerView: 5 },
                        1280: { slidesPerView: 5 },
                    }}
                >
                    {products.map((product, index) => (
                        <SwiperSlide key={index} className="px-2 !w-[250px] block">
                            <div className="h-full flex flex-col">
                                <ProductCard product={product} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>

        </div>
    );
};

export default FlashSaleSection;
