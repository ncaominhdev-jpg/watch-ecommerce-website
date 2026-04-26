import React from 'react';
import Link from 'next/link';
import '../../styles/css/ProductListChatbot.css';

export default function ProductListChatbot({ products, seeMoreUrl }) {
    return (
        <div className="product-list-chatbot">
            {products.map((p, i) => (
                <div key={i} className="product-item-chatbot">
                    <Link href={`/san-pham/${p.slug}`}>
                        <div className="product-link-wrapper">
                            <img src={p.image} alt={p.name} className="product-image-chatbot" />
                            <div className="product-name-chatbot">{p.name}</div>
                            <div className="product-price-wrapper">
                                {p.defaultPrice !== p.minVariantPrice && (
                                    <div className="product-default-price-chatbot">
                                        {p.defaultPrice.toLocaleString()} VND
                                    </div>
                                )}
                                <div className="product-price-chatbot">
                                    {p.minVariantPrice.toLocaleString()} VND
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
            {seeMoreUrl && (
                <div className="see-more-wrapper">
                    <Link href={seeMoreUrl}>
                        <button className="btn-see-more">Xem thêm</button>
                    </Link>
                </div>
            )}
        </div>
    );
}
