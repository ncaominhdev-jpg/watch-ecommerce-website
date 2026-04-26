'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BrandForm from '../../../../../form/BrandForm';
import constants from '../../../../../constants/constants';
import ModalSuccess from '../../../../../components/ModalSuccess/ModalSuccess';
import ModalError from '../../../../../components/ModalError/ModalError';

const BrandEdit = () => {
    const { slug } = useParams();
    const router = useRouter();
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Lấy dữ liệu thương hiệu từ API
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const res = await fetch(`/api/brands/${slug}`);
                const data = await res.json();
                if (res.ok) {
                    setBrand(data);
                } else {
                    console.error("Không tìm thấy thương hiệu:", data.error);
                    setErrorMessage("Không tìm thấy thương hiệu.");
                    setIsErrorOpen(true);
                }
            } catch (err) {
                console.error("Lỗi khi fetch brand:", err);
                setErrorMessage("Lỗi khi tải dữ liệu thương hiệu.");
                setIsErrorOpen(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchBrand();
    }, [slug]);

    // Xử lý cập nhật thương hiệu
    const handleUpdate = async (formData, setError) => {
        try {
            let logo_url = brand.logo_url;

            // Nếu có file logo mới thì upload lên Cloudinary
            if (formData.logo && formData.logo.length > 0) {
                const file = formData.logo[0];
                const cloudData = new FormData();
                cloudData.append("file", file);
                cloudData.append("upload_preset", constants.UPLOAD_PRESET);

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`,
                    { method: "POST", body: cloudData }
                );

                const uploadResult = await uploadRes.json();
                if (!uploadResult.secure_url) throw new Error("Upload ảnh thất bại");

                logo_url = uploadResult.secure_url;
            }

            // Gửi dữ liệu PUT cập nhật
            const res = await fetch("/api/brands", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: brand.id,
                    name: formData.name,
                    description: formData.description,
                    logo_url,
                    status: formData.status === "true" || formData.status === true,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                if (result.error && result.error.includes("Tên thương hiệu")) {
                    setError("name", { type: "server", message: result.error });
                } else {
                    throw new Error(result.error || "Cập nhật thất bại");
                }
                return;
            }

            setSuccessMessage("✔️ Cập nhật thương hiệu thành công");
            setIsSuccessOpen(true);
        } catch (err) {
            console.error("Lỗi khi cập nhật thương hiệu:", err);
            setErrorMessage("❌ Không thể cập nhật thương hiệu");
            setIsErrorOpen(true);
        }
    };

    const handleSuccessClose = () => {
        setIsSuccessOpen(false);
        router.push("/admin/thuong-hieu");
    };

    if (loading) return <p className="text-gray-500">Đang tải dữ liệu...</p>;
    if (!brand) return <p className="text-red-500">Không tìm thấy thương hiệu</p>;

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Cập nhật thương hiệu: {brand?.name || "Đang tải..."}
            </h1>
            <BrandForm onSubmit={handleUpdate} defaultValues={brand} isEdit />

            {/* ✅ Modal success */}
            <ModalSuccess
                isOpen={isSuccessOpen}
                onClose={handleSuccessClose}
                message={successMessage}
            />

            {/* ❌ Modal error */}
            <ModalError
                isOpen={isErrorOpen}
                onClose={() => setIsErrorOpen(false)}
                message={errorMessage}
            />
        </div>
    );
};

export default BrandEdit;
