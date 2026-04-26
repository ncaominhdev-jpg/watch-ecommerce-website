import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductCard({ product }) {
  const showPriceRange =
    product.salePriceMin !== undefined && product.salePriceMax !== undefined;

  return (
    <Link href={`./san-pham/${product.slug}`} className="card
     !min-w-[250px] group h-full bg-white rounded overflow-hidden shadow hover:shadow-sm transition">
      <div className="box_image relative w-full h-[20rem] overflow-hidden">
        <img
          className="image object-cover w-full h-full transition duration-300"
          src={product.image1}
          alt={product.name}
        />
        <img
          className="image_hover object-cover w-full h-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition duration-300"
          src={product.image2}
          alt={product.name}
        />
        {product.discountPercent && (
          <div className="product-card-badge">
            {product.discountPercent}
          </div>
        )}
      </div>

      <div className="product-card-info">

        <h4 className="!line-clamp-1 text-[16px] font-semibold">
          {product.name}
        </h4>
        <div className="product-card-price ">
          {product.originalPrice > product.salePriceMin && (
            <span className="price-original">
              {product.originalPrice?.toLocaleString()} đ
            </span>
          )}
          <span className="price-sale">
            {showPriceRange
              ? product.salePriceMin === product.salePriceMax
                ? `${product.salePriceMin.toLocaleString()} đ`
                : `${product.salePriceMin.toLocaleString()} đ`
              : `${product.salePriceMin?.toLocaleString()} đ`}
          </span>
        </div>

        <p className="product-card-desc">
          {(product.short_description || '').slice(0, 27)}
          {product.short_description?.length > 27 && '...'}
        </p>

      </div>

    </Link>
  );
}
