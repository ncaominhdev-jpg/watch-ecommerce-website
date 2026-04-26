'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaSpinner } from "react-icons/fa";
import Link from 'next/link';
function BlogDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blogs/${slug}`);
                const data = await res.json();

                if (!data?.error) {
                    setPost(data);
                    document.title = data.title;
                }
            } catch (err) {
                console.error("Lỗi khi fetch bài viết:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedPosts = async () => {
            try {
                const res = await fetch('/api/blogs/status');
                const data = await res.json();
                setRelatedPosts(data?.filter(item => item.slug !== slug).slice(0, 4)); // loại trừ bài đang xem
            } catch (err) {
                console.error("Lỗi khi fetch bài viết liên quan:", err);
            }
        };

        if (slug) {
            fetchPost();
            fetchRelatedPosts();
        }
    }, [slug]);

    const BlogCard = (props) => (
        <Link href={`/tin-tuc/${props.slug}`} className="p-1 flex mb-4 hover:bg-gray-50 rounded transition">
            <img
                src={props.image_url || '/images/default-thumbnail.jpg'}
                alt={props.title}
                className="w-[10rem] h-[8rem] lg:w-[14rem] lg:h-[10rem] object-cover rounded"
            />
            <div className="!pl-3 flex flex-col flex-1 text-gray-600">
                <strong className="text-md line-clamp-2">{props.title}</strong>
                <div
                    className="text-sm lg:line-clamp-2 line-clamp-1 text-gray-500 mt-1"
                    dangerouslySetInnerHTML={{ __html: props.short_description }}
                />
                <div className="mt-auto">
                    <small className="text-gray-400">{new Date(props.createdAt).toLocaleDateString('vi-VN')}</small>
                    <span className="!ml-2 text-xs text-orange-700">{props.keyword}</span>
                </div>
            </div>
        </Link>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="animate-spin text-orange-700 w-10 h-10" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-10 text-gray-500">
                Không tìm thấy bài viết.
            </div>
        );
    }

    const formattedDate = new Date(post.createdAt).toLocaleDateString("vi-VN", {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return (
        <main className="blog-detail-container !mx-auto !w-[90%] !lg:w-[70%] !mb-5 !px-4 !py-6">
            <div className='mx-auto w-full  bg-white rounded !p-5'>
                <h1 className="text-3xl lg:text-4xl font-bold text-[#1F2438] mb-4">
                    {post.title}
                </h1>
                <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-2 items-center">
                    <span>{formattedDate}</span>
                    <span className="text-orange-700 font-medium">• {post.keyword}</span>
                </div>
                {/* <div className="mb-8 overflow-hidden rounded shadow">
                    <img
                        src={post.image_url || '/images/default-thumbnail.jpg'}
                        alt={post.title}
                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div> */}
                <article
                    className="prose prose-orange prose-lg max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: post.short_description }}
                />
                <article
                    className="prose prose-orange prose-lg max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>

            <div className='mx-auto w-full !mt-5 bg-white rounded !p-5'>
                <h2 className="text-xl font-bold text-gray-700 !mb-4">Bài viết mới nhất</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {relatedPosts.map((props) => (
                        <BlogCard key={props.id} {...props} />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default BlogDetail;
