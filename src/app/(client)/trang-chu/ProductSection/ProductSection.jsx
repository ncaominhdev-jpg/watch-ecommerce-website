'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../../../../components/ProductCardHome';

const ProductSection = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();

            const filtered = data
                .filter(product => product.status === true)
                .map(product => {
                    const images = product.product_images || [];
                    const activeVariants = (product.product_variants || []).filter(v => v.status === true);

                    let minSalePrice = product.price;
                    let maxSalePrice = product.price;
                    let discountPercent = null;

                    if (activeVariants.length > 0) {
                        const salePrices = activeVariants.map(v =>
                            v.discount && v.discount > 0 ? v.price - v.discount : v.price
                        );

                        minSalePrice = Math.min(...salePrices);
                        maxSalePrice = Math.max(...salePrices);

                        if (product.price && minSalePrice < product.price) {
                            discountPercent = `-${Math.round(((product.price - minSalePrice) / product.price) * 100)}%`;
                        }
                    }

                    return {
                        ...product,
                        image1: images[0]?.image_url || '/placeholder.jpg',
                        image2: images[1]?.image_url || images[0]?.image_url || '/placeholder.jpg',
                        salePriceMin: minSalePrice,
                        salePriceMax: maxSalePrice,
                        originalPrice: product.price,
                        discountPercent,
                        onSale: discountPercent !== null,
                    };
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);

            setProducts(filtered);
        } catch (error) {
            console.error('Lỗi khi gọi API sản phẩm:', error);
        }
    };

    return (
        <>
            <section className="all_product !w-10/12 !mx-auto">
                <div className="box_title flex items-center justify-between !py-3">
                    <h3 className='text-3xl '>Sản phẩm mới nhất</h3>
                    <Link href="/san-pham">Xem tất cả</Link>
                </div>

                <div className="flex flex-wrap w-full box_card">
                    {products.map((product, i) => (
                        <ProductCard key={i} product={product} />
                    ))}
                </div>
                {products.length === 0 && (
                    <div className="w-full text-center py-10">
                        <p className="text-gray-500">Không có sản phẩm nào.</p>
                    </div>
                )}
              
            </section>

        </>
    );
};

export default ProductSection;
