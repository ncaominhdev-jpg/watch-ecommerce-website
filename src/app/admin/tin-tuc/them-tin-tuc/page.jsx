"use client";
import { useRouter } from "next/navigation";
import BlogForm from "../../../../form/BlogForm";
import { useState, useEffect } from 'react'; 
import { toast } from "react-toastify";

export default function Create() {
    const router = useRouter();
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


    const handleAddBlog = async (formData) => {
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
            const res = await fetch("/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Đăng bài viết thành công");
                router.push("/admin/tin-tuc");
            } else {
                toast.error("Lỗi: " + (result.error || "Không thể đăng bài viết"));
            }
        } catch (err) {
            console.error("Lỗi khi gửi bài viết:", err);
            toast.error("Lỗi không xác định");
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
            <BlogForm isEdit={false} onSubmit={handleAddBlog} />
        </div>
    );
}
