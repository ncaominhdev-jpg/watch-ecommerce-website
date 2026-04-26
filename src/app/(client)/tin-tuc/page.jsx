'use client';
import Link from 'next/link';
import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination";
import { Button } from '@mui/material';
import './index.scss';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaSearch, FaSpinner } from "react-icons/fa";

function Blog() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blogs/status');
                const data = await res.json();
                console.log(data);

                if (Array.isArray(data)) {

                    setBlogs(data);
                } else {
                    console.error("API không trả về mảng:", data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy tin tức:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    //===================[ SEARCH ]================
    const [searchResult, setSearchResult] = useState(null);

    const filteredBlogs = blogs.filter(blog => {
        const query = searchQuery.toLowerCase();
        return (
            blog.title.toLowerCase().includes(query) ||
            blog.short_description?.toLowerCase().includes(query) ||
            blog.content?.toLowerCase().includes(query)
        );
    }).slice(0, 5);

    const highlightKeyword = (text, keyword) => {
        if (!text || !keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<span style="color:#EA580C;"><strong>$1</strong></span>');
    };


    const totalBlogs = blogs.length;
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    const currentPosts = blogs.slice(indexOfFirstPost, indexOfLastPost);


    const BlogNoContext = (props) => (
        <Link href={`/tin-tuc/${props.slug}`} className="block !p-1 swiper-slide">
            <img
                src={props.image_url || '/images/default-thumbnail.jpg'}
                alt={props.title}
                className="!w-full !h-48 object-cover rounded"
            />
            <div className="text-gray-600 flex flex-col !mt-2">
                <strong className="!text-md !line-clamp-2">{props.title}</strong>
                <small className="text-gray-400">{new Date(props.createdAt).toLocaleDateString('vi-VN')}</small>
                <span className="!text-xs text-orange-700">{props.keyword}</span>
            </div>
        </Link>
    );

    const BlogGetAll = (props) => (
        <Link href={`/tin-tuc/${props.slug}`} className="!p-1 flex !mb-4 hover:bg-gray-50 rounded transition">
            <img
                src={props.image_url || '/images/default-thumbnail.jpg'}
                alt={props.title}
                className="!w-[10rem] !h-[8rem] !lg:w-[14rem] !lg:h-[10rem] object-cover rounded"
            />
            <div className="text-gray-600 !pl-3 flex flex-col !flex-1">
                <strong className="text-md !line-clamp-2">{props.title}</strong>
                <div className="blog-contenttext-sm !lg:line-clamp-2 line-clamp-1 text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: props.short_description }} />
                <div className="!mt-auto">
                    <small className="text-gray-400">{new Date(props.createdAt).toLocaleDateString('vi-VN')}</small>
                    <span className="!ml-2 text-xs text-orange-700">{props.keyword}</span>
                </div>
            </div>
        </Link>
    );

    if (loading) return (
        <div className="flex items-center justify-center  ">
            <FaSpinner className="animate-spin text-orange-700 w-10 h-10" />
        </div>
    );


    return (
        <main className="home !mx-auto !w-10/12 lg:w-full bg-white rounded !mb-5 !px-4 lg:mt-[9.5rem]">
            <title>Tin tức</title>
            <div className="!lg:w-[80%] !mx-auto !py-3">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="w-full lg:w-[70%] overflow-x-auto">
                       
                    </div>

                    <div className="w-full relative !lg:w-[30%] search">
                        <form
                            className="form"
                            onChange={(e) => {
                                e.preventDefault();
                                const keyword = searchQuery.toLowerCase().trim();
                                if (!keyword) return setSearchResult(null);

                                const found = blogs.find(
                                    (blog) =>
                                        blog.title.toLowerCase().includes(keyword) ||
                                        blog.short_description?.toLowerCase().includes(keyword)
                                );

                                setSearchResult(found || null);
                            }}
                        >

                            <label htmlFor="search">
                                <input
                                    className={`input ${searchQuery ? 'has-value' : ''} !text-gray-600`}
                                    type="text"
                                    placeholder="Tìm kiếm thông tin"
                                    id="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                <div className="fancy-bg"></div>
                                <div className="search text-gray-600">
                                    <FaSearch className="text-gray-500 w-5 h-5" />
                                </div>
                            </label>
                        </form>
                        {searchQuery && filteredBlogs.length > 0 && (
                            <div className="mt-4 absolute w-full top-10 !p-4 bg-gray-100 flex flex-col gap-1 space-y-2">
                                {filteredBlogs.map((blog) => (
                                    <Link
                                        key={blog.id}
                                        href={`/tin-tuc/${blog.slug}`}
                                        className="block bg-white rounded shadow !p-4  transition hover:bg-orange-50"
                                    >
                                        <strong className="text-md text-orange-700">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightKeyword(blog.title, searchQuery),
                                                }}
                                            />
                                        </strong>

                                        <p
                                            className="text-sm text-gray-600 mt-1 line-clamp-2"
                                            dangerouslySetInnerHTML={{
                                                __html: highlightKeyword(blog.short_description, searchQuery),
                                            }}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center !mb-4">
                        <h2 className="text-3xl min-w-max !mr-3 text-[#1F2438] font-semibold">Tin tức nổi bật</h2>
                        <hr className="w-full border-[#1F2438] border-2 !mt-2" />
                    </div>

                    <div className="lg:grid lg:grid-cols-2 gap-4 py-3">
                        <div>{blogs.slice(0, 1).map((props) => <BlogNoContext key={props.id} {...props} />)}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {blogs.slice(1, 5).map((props) => <BlogNoContext key={props.id} {...props} />)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 !my-6">
                    <div className="lg:w-[20%] w-full bg-gradient-to-r from-[#1F2438] to-[#1F2438] text-white rounded-lg flex flex-col justify-center items-center p-6">
                        <h2 className="lg:text-3xl text-xl font-bold mb-2">Khám phá</h2>
                        <p className="text-sm">Đồng hồ </p>
                    </div>

                    <div className="lg:w-[80%] w-full  overflow-x-auto">
                        <div className="p-2">
                            <Swiper
                                spaceBetween={16}
                                slidesPerView={"auto"}
                                className="w-full !flex !overflow-hidden"
                            >
                                {blogs.slice(0, 4).map((props) => (
                                    <SwiperSlide key={props.id} className="!w-[250px]">
                                        <BlogNoContext {...props} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex !my-6 items-center">
                        <h2 className="text-3xl min-w-max !mr-3 text-[#1F2438] font-semibold">Tất cả bài viết</h2>
                        <hr className="w-full border-[#1F2438] border-2 !mt-2" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {currentPosts.map((props) => (
                            <BlogGetAll key={props.id} {...props} />
                        ))}
                    </div>


                    {totalBlogs > itemsPerPage && (
                        <div className="flex justify-center !mt-8">
                            <Pagination
                                count={totalBlogs}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Blog;
