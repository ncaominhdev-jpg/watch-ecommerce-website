import React from 'react';
import Link from 'next/link';
import '../../styles/css/BlogListChatbot.css';

export default function BlogListChatbot({ blogs, seeMoreUrl }) {
    return (
        <div className="blog-list-chatbot">
            {blogs.map((b, i) => (
                <Link href={`/blog/${b.id}`} key={i} className="blog-item-chatbot">
                    <div className="blog-link-wrapper">
                        {b.image_url && (
                            <img src={b.image_url} alt={b.title} className="blog-image-chatbot" />
                        )}
                        <div className="blog-info-chatbot">
                            <div className="blog-title-chatbot">
                                {b.title.length > 30 ? b.title.slice(0, 30) + "..." : b.title}
                            </div>
                            {b.short_description && (
                                <div className="blog-short-description-chatbot">
                                    {b.short_description}
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
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
