'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FiPlus, FiMinus } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/navigation';
import { FaShoppingCart, FaMoneyCheckAlt } from "react-icons/fa";
import Link from 'next/link';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DetailProduct = () => {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug;
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const imageRef = useRef(null);
    const magnifierRef = useRef(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [showOriginalPrice, setShowOriginalPrice] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [descOverflow, setDescOverflow] = useState(false);
    const descRef = useRef();
    const [selectedStar, setSelectedStar] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${slug}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                setProduct(data);
                setMainImage(data.product_images?.[0]?.image_url || '/default.jpg');

                const cheapestVariant = data.product_variants?.reduce((min, v) => {
                    const priceAfterDiscount = v.price - (v.discount || 0);
                    const minPrice = min.price - (min.discount || 0);
                    return priceAfterDiscount < minPrice ? v : min;
                }, data.product_variants?.[0]);

                if (cheapestVariant) {
                    const finalPrice = cheapestVariant.price - (cheapestVariant.discount || 0);
                    setSelectedVariant(cheapestVariant);
                    setCalculatedPrice(finalPrice);
                    setShowOriginalPrice(finalPrice !== data.price);
                }
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết sản phẩm:', err.message);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    useEffect(() => {
        const checkOverflow = () => {
            const el = descRef.current;
            if (el && el.scrollHeight > 300) {
                setDescOverflow(true);
            }
        };
        checkOverflow();
    }, [product]);

    const increaseQuantity = () => setQuantity((prev) => prev + 1);
    const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    const handleImageChange = (src) => setMainImage(src);

    const handleMouseMove = (e) => {
        if (imageRef.current && magnifierRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const scale = 3;
            const width = magnifierRef.current.offsetWidth;
            const height = magnifierRef.current.offsetHeight;
            const cx = x - width / 2;
            const cy = y - height / 2;

            magnifierRef.current.style.display = 'block';
            magnifierRef.current.style.left = `${x - width / 2}px`;
            magnifierRef.current.style.top = `${y - height / 2}px`;
            magnifierRef.current.style.backgroundImage = `url(${mainImage})`;
            magnifierRef.current.style.backgroundSize = `${imageRef.current.width * scale}px ${imageRef.current.height * scale}px`;
            magnifierRef.current.style.backgroundPosition = `-${cx * scale}px -${cy * scale}px`;
        }
    };

    const handleMouseOut = () => {
        if (magnifierRef.current) magnifierRef.current.style.display = 'none';
    };

    const handleAddToCart = async () => {
        try {
            const token = Cookies.get('jwt-datt');
            if (!token) {
                toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
                setTimeout(() => {
                    router.push('/dang-nhap');
                }, 1500);
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;
            
            if(!userId) {
                console.error("Lỗi giải mã JWT:", err);
                toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
                setTimeout(() => {
                    router.push('/dang-nhap');
                }, 1500);
                return;
            }

            if (!selectedVariant || !product) {
                toast.error("Vui lòng chọn phiên bản sản phẩm.");
                return;
            }

            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity,
                    user_id: userId,
                    product_variant_id: selectedVariant.id,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');

            toast.success("Thêm vào giỏ hàng thành công");
        } catch (err) {
            console.error('Lỗi khi thêm giỏ hàng:', err.message);
            toast.error("Thêm vào giỏ hàng thất bại");
        }
    };

    const handleBuyNow = async () => {
        try {
            const token = Cookies.get('jwt-datt');
            if (!token) {
                toast.error("Bạn cần đăng nhập để mua hàng.");
                setTimeout(() => {
                    router.push('/dang-nhap');
                }, 1500);
                return;
            }

            let userId = null;
            try {
                const decoded = jwtDecode(token);
                userId = decoded.id;
            } catch (err) {
                console.error("Lỗi giải mã JWT:", err);
                toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
                setTimeout(() => {
                    router.push('/dang-nhap');
                }, 1500);
                return;
            }

            if (!selectedVariant || !product) {
                toast.error("Vui lòng chọn phiên bản sản phẩm.");
                return;
            }

            const selectedItem = {
                id: Date.now(), // tạm thời tạo id
                user_id: userId,
                product_id: product.id,
                product_variant_id: selectedVariant.id,
                quantity,
                product: {
                    name: product.name,
                    price: product.price,
                    product_images: product.product_images.slice(0, 1), // chỉ lấy 1 hình
                },
                variant: {
                    name_color: selectedVariant.name_color,
                    price: selectedVariant.price,
                    discount: selectedVariant.discount,
                }
            };

            localStorage.setItem("checkoutItems", JSON.stringify([selectedItem]));
            router.push("/thanh-toan");
        } catch (err) {
            console.error('Lỗi khi thực hiện mua ngay:', err.message);
            toast.error("Không thể mua ngay lúc này.");
        }
    };

    const ratingStats = React.useMemo(() => {
        if (!product?.reviews) return [];
        return [5, 4, 3, 2, 1].map((star) => {
            const count = product.reviews.filter(r => r.status && r.rating === star).length;
            return { star, count };
        });
    }, [product]);

    const filteredReviews = React.useMemo(() => {
        if (!product?.reviews) return [];
        return selectedStar
            ? product.reviews.filter(r => r.status && r.rating === selectedStar)
            : product.reviews.filter(r => r.status);
    }, [product, selectedStar]);

    const totalReviews = ratingStats.reduce((sum, s) => sum + s.count, 0);


    if (!product) return <p className="dp-loading">Đang tải sản phẩm...</p>;


    return (
        <main className="dp-wrapper">
            <section className="dp-section dp-gallery-info">
                <aside className="dp-gallery">
                    <div className="dp-thumbnails flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                        {product.product_images?.map((img, index) => (
                            <div key={index} className="cursor-pointer">
                                <img
                                    src={img.image_url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="dp-thumbnail border border-gray-200 hover:border-blue-500 transition"
                                    onClick={() => handleImageChange(img.image_url)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="dp-main-image">
                        <img
                            src={mainImage}
                            alt="Main"
                            ref={imageRef}
                            onMouseMove={handleMouseMove}
                            onMouseOut={handleMouseOut}
                        />
                        <div className="dp-magnifier" ref={magnifierRef}></div>
                    </div>
                </aside>

                <article className="dp-info">
                    <h3 className="dp-title">{product.name}</h3>
                    <p className="dp-short-desc">{product.short_description}</p>

                    <div className="dp-price-wrap">
                        <h5 className="dp-price">
                            {calculatedPrice?.toLocaleString()} vnđ
                        </h5>
                        {showOriginalPrice && (
                            <h5 className="dp-original-price">
                                {product.price?.toLocaleString()} vnđ
                            </h5>
                        )}
                    </div>

                    <div className="dp-variant-wrap">
                        <h6 className="dp-label">Phiên bản:</h6>
                        <div className="dp-variant-list">
                            {product.product_variants?.map((variant, index) => {
                                const isDisabled = !variant.status || variant.quantity === 0;
                                const isActive = selectedVariant?.id === variant.id;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`dp-variant-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                        onClick={() => {
                                            if (isDisabled) return;
                                            const final = variant.price - (variant.discount || 0);
                                            setSelectedVariant(variant);
                                            setCalculatedPrice(final);
                                            setShowOriginalPrice(final !== product.price);
                                        }}
                                        disabled={isDisabled}
                                        title={isDisabled ? 'Biến thể này không khả dụng' : ''}
                                    >
                                        <span
                                            className="dp-color-dot"
                                            style={{
                                                backgroundColor: variant.code_color,
                                                opacity: isDisabled ? 0.4 : 1,
                                                border: isDisabled ? '1px dashed #999' : undefined,
                                            }}
                                        ></span>
                                        <span className="dp-color-name">
                                            {variant.name_color}
                                            {isDisabled && ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                    </div>

                    <div className="dp-quantity-wrap">
                        <h6 className="dp-label">Số lượng:</h6>
                        <div className="dp-quantity">
                            <button onClick={decreaseQuantity} className="dp-qty-btn">
                                <FiMinus />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                readOnly
                                className="dp-qty-input"
                            />
                            <button onClick={increaseQuantity} className="dp-qty-btn">
                                <FiPlus />
                            </button>
                        </div>
                    </div>

                    <div className="dp-action-buttons">
                        <button className="dp-add-to-cart" onClick={handleAddToCart}>
                            <FaShoppingCart className="dp-cart-icon" />
                            Thêm giỏ hàng
                        </button>
                        <button className="dp-buy-now" onClick={handleBuyNow}>
                            <FaMoneyCheckAlt className="dp-cart-icon" />
                            Mua ngay
                        </button>
                    </div>
                </article>
            </section>

            <section className="dp-description">
                <h4 className="dp-section-title">CHI TIẾT SẢN PHẨM</h4>

                <div className="dp-desc-row">
                    <div className="dp-desc-item">
                        <label>Danh mục:</label>
                        <Link
                            href={`/san-pham?category=${product.category?.slug}`}
                            className="dp-desc-text text-blue-600 hover:underline"
                        >
                            {product.category?.name}
                        </Link>
                    </div>
                    <div className="dp-desc-item">
                        <label>Thương hiệu:</label>
                        <Link
                            href={`/san-pham?brands=${product.brand?.slug}`}
                            className="dp-desc-text text-blue-600 hover:underline"
                        >
                            {product.brand?.name}
                        </Link>
                    </div>
                    <div className="dp-desc-item">
                        <label>Bảo hành:</label>
                        <p className="dp-desc-text">{product.warranty || '12 tháng'}</p>
                    </div>
                </div>

                <section className="dp-product-description mt-6">
                    <h4 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800">MÔ TẢ SẢN PHẨM</h4>

                    <div
                        ref={descRef}
                        className={`dp-desc-html relative text-gray-700 transition-all duration-500 ease-in-out overflow-hidden ${showFullDesc ? 'max-h-full' : 'max-h-[200px]'
                            }`}
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    ></div>

                    {descOverflow && (
                        <div className="text-center mt-4">
                            <button
                                onClick={() => setShowFullDesc(prev => !prev)}
                                className="text-sm text-blue-600 hover:underline font-medium"
                            >
                                {showFullDesc ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                            </button>
                        </div>
                    )}
                </section>
            </section>

            <section className="reviews-section">
                <h4 className="reviews-title">Đánh giá của khách hàng</h4>

                {product.reviews?.length === 0 ? (
                    <p className="reviews-empty">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                    <>
                        <div className="review-summary">
                            {ratingStats.map(({ star, count }) => (
                                <button
                                    key={star}
                                    onClick={() => setSelectedStar(prev => prev === star ? null : star)}
                                    className={`review-filter-btn ${selectedStar === star ? 'active' : ''}`}
                                >
                                    {'★'.repeat(star)}{'☆'.repeat(5 - star)} ({count})
                                </button>
                            ))}
                        </div>

                        {filteredReviews?.length === 0 ? (
                            <p className="reviews-empty">Chưa có đánh giá nào cho mức sao này.</p>
                        ) : (
                            <div className="reviews-list">
                                {filteredReviews.map((review, idx) => (
                                    <div key={review.id ?? `review-${idx}`} className="review-card">
                                        <div className="review-header">
                                            <div className="review-user-info">
                                                <strong>{review.user?.name || 'Người dùng ẩn danh'}</strong>
                                                <span className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="review-stars">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>

                                        <p className="review-comment">{review.comment || <i>(Không có nhận xét)</i>}</p>

                                        {review.review_images?.length > 0 && (
                                            <div className="review-images">
                                                {review.review_images.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img.image_url}
                                                        alt={`Ảnh đánh giá ${i + 1}`}
                                                        className="review-image"
                                                        onClick={() => setSelectedImage(img.image_url)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </div>

                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {selectedImage && (
                <div className="image-viewer-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Ảnh đánh giá" />
                        <button className="close-btn" onClick={() => setSelectedImage(null)}>×</button>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />

        </main>
    );
};

export default DetailProduct;
