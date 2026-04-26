"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import config from "../../../src/constants/constants";

const MyEditor = dynamic(() => import("../../components/Editor"), { ssr: false });

const removeVietnameseTones = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

const generateSlug = (text) =>
    removeVietnameseTones(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};

const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", config.UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${config.CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
};

const BlogForm = ({ onSubmit, isEdit = false, defaultValues = {} }) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues,
        mode: "onChange",
    });

    // Đồng bộ lại form khi defaultValues thay đổi
    useEffect(() => {
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
            if (defaultValues.image_url) {
                setImagePreview(defaultValues.image_url);
            }
        }
    }, [defaultValues, reset]);

    const title = watch("title") || "";
    const short_description = watch("short_description") || "";
    const content = watch("content") || "";
    const keyword = watch("keyword") || "";
    const imageFile = watch("image");

    const [seoTips, setSeoTips] = useState({ title: [], short_description: [], content: [] });
    const [openTips, setOpenTips] = useState({ title: true, short_description: true, content: true });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const newTips = { title: [], short_description: [], content: [] };
        const keywords = keyword.split(",").map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0);

        if (imageFile && imageFile.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(imageFile[0]);
        } else if (defaultValues.image_url) {
            setImagePreview(defaultValues.image_url);
        } else {
            setImagePreview(null);
        }

        if (title.length < 10) newTips.title.push("Tiêu đề nên dài từ 10–60 ký tự.");
        if (title.length > 100) newTips.title.push("Tiêu đề không nên vượt quá 100 ký tự.");
        if (title && title.length > 0 && title[0] !== title[0].toUpperCase())
            newTips.title.push("Tiêu đề nên viết hoa chữ cái đầu.");
        if (title.match(/[@#%^*()=\[\]{};'"\\|.<>\/]/))
            newTips.title.push("Tiêu đề không nên chứa ký tự đặc biệt.");

        if (title) {
            setValue("slug", generateSlug(title), { shouldValidate: true });
        } else {
            setValue("slug", "", { shouldValidate: true });
        }

        if (stripHtml(short_description).length < 120)
            newTips.short_description.push("Mô tả nên dài từ 120–160 ký tự.");
        if (stripHtml(short_description).length > 500)
            newTips.short_description.push("Mô tả không nên vượt quá 500 ký tự.");
        if (short_description.match(/<img/))
            newTips.short_description.push("Mô tả ngắn không nên chứa hình ảnh.");

        if (stripHtml(content).length < 1800)
            newTips.content.push("Nội dung nên dài từ 1800 ký tự trở lên.");
        if (!/https?:\/+/.test(content)) newTips.content.push("Nội dung nên có ít nhất 1 liên kết (URL).");

        const imgTags = content.match(/<img[^>]+>/g) || [];
        if (!/<img/.test(content)) {
            newTips.content.push("Nội dung nên có ít nhất 1 hình ảnh với thuộc tính alt.");
        } else {
            imgTags.forEach((img) => {
                if (!img.includes('alt="') || img.includes('alt=""')) {
                    newTips.content.push("Tất cả hình ảnh trong nội dung nên có thuộc tính alt mô tả.");
                }
            });
        }

        if (keywords.length > 0) {
            const includesAny = (text) => keywords.some((k) => text.toLowerCase().includes(k));
            if (!includesAny(title)) newTips.title.push("Tiêu đề nên chứa ít nhất một từ khóa chính.");
            if (!includesAny(stripHtml(short_description)))
                newTips.short_description.push("Mô tả nên chứa ít nhất một từ khóa chính.");
            if (!includesAny(stripHtml(content)))
                newTips.content.push("Nội dung nên chứa ít nhất một từ khóa chính.");

            keywords.forEach((k) => {
                const count = (stripHtml(content).toLowerCase().match(new RegExp(k, "g")) || []).length;
                const wordCount = stripHtml(content).split(/\s+/).length;
                const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
                if (density < 0.5) newTips.content.push(`Mật độ từ khóa "${k}" quá thấp, nên từ 0.5–5%.`);
                if (density > 5) newTips.content.push(`Mật độ từ khóa "${k}" quá cao, nên từ 0.5–5%.`);
            });
        } else {
            newTips.keyword = ["Vui lòng nhập ít nhất một từ khóa chính."];
        }

        setSeoTips(newTips);
    }, [title, short_description, content, keyword, imageFile, defaultValues.image_url, setValue]);

    const handleFormSubmit = async (data) => {
        try {
            if (data.image && data.image.length > 0) {
                const uploadedImageUrl = await uploadImageToCloudinary(data.image[0]);
                data.image_url = uploadedImageUrl;
                delete data.image;
            }

            const processImagesIfNeeded = async (html) => {
                if (!html || !html.includes("<img")) return html;
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const images = doc.getElementsByTagName("img");

                for (let img of images) {
                    const src = img.getAttribute("src");
                    if (src && src.startsWith("data:")) {
                        const response = await fetch(src);
                        const blob = await response.blob();
                        const cloudinaryUrl = await uploadImageToCloudinary(blob);
                        img.setAttribute("src", cloudinaryUrl);
                    }
                }
                return doc.body.innerHTML;
            };

            if (data.short_description?.includes("<img")) {
                data.short_description = await processImagesIfNeeded(data.short_description);
            }

            if (data.content?.includes("<img")) {
                data.content = await processImagesIfNeeded(data.content);
            }

            if (onSubmit) {
                onSubmit(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
            alert("Lỗi khi tải ảnh lên Cloudinary: " + error.message);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                {isEdit ? "Sửa bài viết" : "Thêm bài viết mới"}
            </h1>
            <div className="flex gap-6">
                <form  className="w-8/12">
                    <div className="mt-2">
                        <label className="font-medium block">Tiêu đề bài viết</label>
                        <input
                            {...register("title", { required: "Tiêu đề không được để trống" })}
                            className="w-full p-2 border rounded mt-1"
                            placeholder="Nhập tiêu đề"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="flex">
                        <div className="mt-2 w-6/12">
                            <label className="font-medium block">Ảnh bài viết</label>
                            <input
                                type="file"
                                {...register("image", {
                                    validate: (fileList) => {
                                        if (!isEdit && (!fileList || fileList.length === 0)) {
                                            return "Vui lòng chọn ảnh";
                                        }
                                        return true;
                                    }
                                })}
                                accept="image/*"
                                className="mt-1 block"
                            />

                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
                            {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 max-w-[90%] rounded shadow" />}
                        </div>
                        <div className="mt-2 w-6/12">
                            <label className="font-medium block">Đường dẫn trang tin tức</label>
                            <textarea
                                {...register("slug", {
                                    required: "Đường dẫn không được để trống",
                                    pattern: {
                                        value: /^[a-z0-9-]+$/,
                                        message: "Chỉ chữ thường, số và dấu gạch ngang",
                                    },
                                    onChange: (e) => {
                                        setValue("slug", e.target.value, { shouldValidate: true });
                                    },
                                })}
                                className="w-full p-2 border rounded mt-1"
                                rows={2}
                            />
                            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="font-medium block">Mô tả ngắn</label>
                        <input
                            type="hidden"
                            {...register("short_description", {
                                required: "Mô tả ngắn không được để trống",
                                validate: (value) =>
                                    stripHtml(value).trim().length > 0 || "Mô tả ngắn không được để trống",
                            })}
                        />
                        <MyEditor
                            value={short_description}
                            onChange={(val) => setValue("short_description", val, { shouldValidate: true })}
                        />
                        {errors.short_description && (
                            <p className="text-red-500 text-sm mt-1">{errors.short_description.message}</p>
                        )}
                    </div>

                    <div className="mt-3">
                        <label className="font-medium block">Nội dung bài viết</label>
                        <input
                            type="hidden"
                            {...register("content", {
                                required: "Nội dung bài viết không được để trống",
                                validate: (value) =>
                                    stripHtml(value).trim().length > 0 || "Nội dung bài viết không được để trống",
                            })}
                        />
                        <MyEditor
                            value={content}
                            onChange={(val) => setValue("content", val, { shouldValidate: true })}
                            onUpdate={({ editor }) => {
                                const html = editor.getHTML();
                                if (html !== content) {
                                    setValue("content", html, { shouldValidate: true });
                                }
                            }}
                        />

                        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                    </div>

                    <div className="mt-2">
                        <label className="font-medium block">Trạng thái</label>
                        <select {...register("status")} className="w-full p-2 border rounded mt-1">
                            <option value="true">Hiển thị</option>
                            <option value="false">Ẩn</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        onClick={handleSubmit(handleFormSubmit)}
                        className="bg-blue-900 hover:bg-blue-700 text-white py-2 px-4 mt-4 rounded shadow"
                    >
                        {isEdit ? "Cập nhật bài viết" : "Đăng bài viết"}
                    </button>
                </form>

                <aside className="w-4/12 bg-gray-100 p-4 border rounded space-y-6 h-fit">
                    <h3 className="text-lg font-semibold mb-2 text-orange-700">Cảnh báo SEO</h3>
                    <div>
                        <label htmlFor="keyword" className="font-medium block">
                            Từ khóa chính <span className="text-gray-500 text-sm">(cách nhau bằng dấu phẩy)</span>
                        </label>
                        <input
                            id="keyword"
                            {...register("keyword", {
                                required: "Vui lòng nhập ít nhất 1 từ khóa.",
                                validate: (value) => {
                                    const keywords = value
                                        .split(",")
                                        .map((k) => k.trim())
                                        .filter((k) => k.length > 0);
                                    return keywords.length > 0 || "Tối thiểu 1 từ khóa hợp lệ.";
                                },
                            })}
                            className="w-full p-2 border-1 rounded mt-1"
                            placeholder="Ví dụ: đồng hồ, thời trang, đeo tay"
                        />

                        {errors.keyword && (
                            <p className="text-red-500 text-sm mt-1">{errors.keyword.message}</p>
                        )}
                    </div>

                    <div className="mt-2">
                        <div
                            onClick={() =>
                                setOpenTips((prev) => ({ ...prev, title: !prev.title }))
                            }
                            className="flex items-center justify-between cursor-pointer select-none"
                        >
                            <h5 className="font-medium mt-2">
                                Tiêu đề bài viết <span className="text-red-600">({seoTips.title.length} lỗi)</span>
                            </h5>
                            {openTips.title ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </div>
                        {openTips.title && (
                            <>
                                {seoTips.title.length > 0 ? (
                                    <ul className="text-red-600 text-sm list-disc list-inside mt-2">
                                        {seoTips.title.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-600 text-sm mt-1">Đã tối ưu tốt.</p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mt-2">
                        <div
                            onClick={() =>
                                setOpenTips((prev) => ({
                                    ...prev,
                                    short_description: !prev.short_description,
                                }))
                            }
                            className="flex items-center justify-between cursor-pointer select-none"
                        >
                            <h5 className="font-medium">
                                Mô tả ngắn <span className="text-red-600">({seoTips.short_description.length} lỗi)</span>
                            </h5>
                            {openTips.short_description ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </div>
                        {openTips.short_description && (
                            <>
                                {seoTips.short_description.length > 0 ? (
                                    <ul className="text-red-600 text-sm list-disc list-inside mt-2">
                                        {seoTips.short_description.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-600 text-sm mt-1">Đã tối ưu tốt.</p>
                                )}
                            </>
                        )}
                    </div>

                    <div>
                        <div
                            onClick={() =>
                                setOpenTips((prev) => ({
                                    ...prev,
                                    content: !prev.content,
                                }))
                            }
                            className="flex items-center justify-between cursor-pointer select-none"
                        >
                            <h5 className="font-medium">
                                Nội dung bài viết <span className="text-red-600">({seoTips.content.length} lỗi)</span>
                            </h5>
                            {openTips.content ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </div>
                        {openTips.content && (
                            <>
                                {seoTips.content.length > 0 ? (
                                    <ul className="text-red-600 text-sm list-disc list-inside mt-2">
                                        {seoTips.content.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-600 text-sm mt-1">Đã tối ưu tốt.</p>
                                )}
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BlogForm;