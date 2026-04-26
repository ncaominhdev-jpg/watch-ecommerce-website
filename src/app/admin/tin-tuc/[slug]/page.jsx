"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlogForm from "../../../../form/BlogForm";
import { toast } from "react-toastify";

export default function EditBlogPage({ params }) {
    const router = useRouter();
    const slug = params?.slug;
    const [defaultValues, setDefaultValues] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

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

    useEffect(() => {
        const fetchBlog = async () => {
            if (!slug) return;

            try {
                const res = await fetch(`/api/blogs/${slug}`);
                const contentType = res.headers.get("content-type");

                if (!res.ok) {
                    console.error("Lỗi server hoặc không tìm thấy bài viết.");
                    toast.error("Không tìm thấy bài viết.");
                    return;
                }

                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();

                    setDefaultValues({
                        title: data.title || "",
                        slug: data.slug || "",
                        short_description: data.short_description || "",
                        content: data.content || "",
                        keyword: data.keyword || "",
                        status: data.status?.toString() || "true",
                        image_url: data.image_url || "",
                    });
                } else {
                    const text = await res.text();
                    console.error("Phản hồi không hợp lệ:", text);
                    toast.error("Phản hồi không hợp lệ từ máy chủ.");
                }
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
                toast.error("Không thể tải bài viết. Kiểm tra lại API.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);


    const handleUpdateBlog = async (formData) => {
        const dataToSend = {
            title: formData.title,
            slug: formData.slug,
            short_description: formData.short_description,
            content: formData.content,
            status: formData.status === "true",
            user_id: user.id,
            image_url: formData.image_url,
            keyword: formData.keyword,
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
                toast.error("Phản hồi không hợp lệ từ máy chủ khi cập nhật.");
                return;
            }

            if (res.status === 403) {
                toast.warning("Bạn không có quyền chỉnh sửa bài viết này.");
                return;
            }

            if (res.ok) {
                toast.success("Cập nhật bài viết thành công");
                router.push("/admin/tin-tuc");
            } else {
                toast.error("Lỗi: " + (result.error || "Không thể cập nhật bài viết"));
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật:", err);
            toast.error("Lỗi không xác định khi cập nhật.");
        }
    };

    if (loading) return <p className="text-center">Đang tải dữ liệu...</p>;

    if (!defaultValues) return <p className="text-center text-red-500">Không có dữ liệu để hiển thị.</p>;

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
            <BlogForm isEdit={true} defaultValues={defaultValues} onSubmit={handleUpdateBlog} />
        </div>
    );
}
