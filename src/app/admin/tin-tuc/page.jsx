'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import FormDelete from '../../../components/formDelete/index';
import { toast } from "react-toastify";
import { FaSearch, FaSpinner } from "react-icons/fa";
import Pagination from "../../../components/Pagination";



const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    //====================[ SEARCH ]=================================
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBlogs = blogs.filter((b) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            b.title?.toLowerCase().includes(lowerSearch) ||
            b.user_name?.toLowerCase().includes(lowerSearch) ||
            b.content?.toLowerCase().includes(lowerSearch)
        );
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleBlogs = filteredBlogs.slice(startIndex, endIndex);
    const totalBlogs = filteredBlogs?.length || 0;


    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/account/decodeJwtCookie', {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                console.error('Lỗi khi gọi API decodeJwtCookie:', err);
            }
        }

        fetchUser();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs');
            const data = await res.json();
            console.log('Kết quả từ API:', data);

            if (!Array.isArray(data)) {
                console.error("API không trả về mảng:", data);
                setBlogs([]);
                return;
            }

            setBlogs(data);
        } catch (error) {
            console.error("Lỗi khi lấy tin tức:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);



    //====================[ UPDATE STATUS ]==================
    const handleUpdateBlog = async (slug, currentStatus) => {
        const dataToSend = {
            status: !currentStatus,
        };
        try {
            const res = await fetch(`/api/blogs/${slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            const contentType = res.headers.get("content-type");
            let result = {};


            if (contentType?.includes("application/json")) {
                result = await res.json();
            } else {
                const text = await res.text();
                console.error("Phản hồi không hợp lệ khi cập nhật:", text);
                return;
            }

            if (res.ok) {
                toast.success('Cập nhật thành công')
                fetchBlogs();
            } else {
                toast.error("Lỗi: " + (result.error || "Không thể cập nhật bài viết"));
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật:", err);
        }
    };
    //====================[ DELETE ]=========================
    const handleDeleteClick = (slug) => {
        setSelectedSlug(slug);
        setDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSlug) return;

        try {
            const res = await fetch(`/api/blogs/${selectedSlug}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 403) {
                toast.warning("Bạn không có quyền xóa bài viết này.");
                return;
            }

            if (!res.ok) {
                const result = await res.json();
                toast.error("Lỗi: " + (result.error || "Không thể xoá bài viết"));
                return;
            }

            setDeleteConfirm(false);
            setSelectedSlug(null);
            fetchBlogs();
            toast.success("Đã xoá bài viết thành công");


        } catch (err) {
            console.error("Lỗi khi xóa:", err);
            toast.error("Lỗi khi xoá bài viết");
        }
    };





    return (
        <>
            <div className="pm-container container py-3">
                <div className="d-flex justify-between items-center mb-4">
                    <h4 className="pm-title text-xl font-semibold">Quản lý bài viết</h4>
                    <Link
                        href="/admin/tin-tuc/them-tin-tuc"
                        className="bg-blue-900 text-white px-3 py-2 rounded hover:bg-blue-800">
                        Thêm tin tức
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center ">
                        <FaSpinner className="animate-spin text-orange-700 w-10 h-10" />
                    </div>
                ) : blogs.length === 0 ? (
                    <p>Chưa có bài viết nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="mb-4 flex justify-end">
                            <input
                                type="text"
                                placeholder="Tìm theo tiêu đề, người đăng, nội dung..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border px-3 py-2 rounded w-full max-w-md"
                            />
                        </div>

                        <table className="table table-bordered table-hover align-middle text-center w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th>#</th>
                                    <th>Tiêu đề</th>
                                    <th>Ảnh</th>
                                    <th>Mô tả ngắn</th>
                                    <th>Người đăng</th>
                                    <th>Ngày tạo</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleBlogs.map((b, index) => (
                                    <tr key={b.id}>
                                        <td className="!align-middle">{index + 1}</td>

                                        <td className="text-left max-w-[150px] align-middle">{b.title}</td>

                                        <td className="text-left max-w-[2rem] align-middle">
                                            <img src={b.image_url} alt={b.name} className="max-h-12 object-contain" />
                                        </td>

                                        <td className="text-left max-w-[300px] align-middle">
                                            {b.short_description
                                                ? b.short_description.replace(/<[^>]+>/g, '').slice(0, 100) + '...'
                                                : ''}
                                        </td>

                                        <td className="align-middle">{b.user.name || ''}</td>

                                        <td className="align-middle">
                                            {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                                        </td>

                                        <td className="!align-middle">
                                            <label className="switch-button" htmlFor={`switch-${b.id}`}>
                                                <div className="switch-outer">
                                                    <input
                                                        id={`switch-${b.id}`}
                                                        type="checkbox"
                                                        checked={b.status}
                                                        onChange={() => handleUpdateBlog(b.slug, b.status)}
                                                    />
                                                    <div className="button">
                                                        <span className="button-toggle"></span>
                                                        <span className="button-indicator"></span>
                                                    </div>
                                                </div>
                                            </label>
                                        </td>

                                        <td className="align-middle">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/tin-tuc/${b.slug}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                >
                                                    Sửa
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteClick(b.slug)}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                        <div className="flex justify-center !mt-8">
                            <Pagination
                                count={totalBlogs}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>

                )}
            </div>
            <FormDelete
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                message="Bạn có chắc chắn muốn xoá bài viết này?"
            />
        </>
    );
};

export default BlogList;
