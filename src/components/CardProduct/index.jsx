'use client';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const image1 = product.product_images?.[0]?.image_url || '/default.jpg';
  const image2 = product.product_images?.[1]?.image_url || image1;

  const productVariant = product.product_variants?.[0];
  const originalPrice = productVariant?.price || product.price || 0;
  const discount = productVariant?.discount || 0;
  const salePrice = originalPrice - discount;

  const hasSale = discount > 0;

  const formatPrice = (value) =>
    value ? value.toLocaleString('vi-VN') + 'đ' : '';

  return (
    <Link href={`./san-pham/${product.slug}`} className="product-card">
      {/* Hình ảnh */}
      <div className="product-card-image">
        <img
          className="product-image"
          src={image1}
          alt={product.name}
        />
        <img
          className="product-image-hover"
          src={image2}
          alt={product.name}
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="product-card-info">
        {/* Tên sản phẩm */}
        <h4 className="product-card-name">
          {product.name}
        </h4>

        {/* Giá */}
        <div className="product-card-price">
          {hasSale ? (
            <>
              <span className="price-original">
                {formatPrice(originalPrice)}
              </span>
              <span className="price-sale">
                {formatPrice(salePrice)}
              </span>
            </>
          ) : (
            <span className="price-final">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Mô tả ngắn */}
        <p className="product-card-desc !line-clamp-3">
          {product.short_description}
        </p>
      </div>

      {/* Badge khuyến mãi */}
      {hasSale && (
        <div className="product-card-badge">
          -{Math.round((discount / originalPrice) * 100)}%
        </div>
      )}
    </Link>
  );
}
