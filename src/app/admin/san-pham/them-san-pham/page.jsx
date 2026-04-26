'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../../../../form/ProductForm";
import constants from "../../../../constants/constants";
import { toast } from "react-toastify";
import ModalSuccess from "../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../components/ModalError/ModalError";

const ProductCreate = () => {
  const router = useRouter();

  // State modal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", constants.UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const result = await res.json();
    if (!result.secure_url) throw new Error("Upload ảnh thất bại");
    return result.secure_url;
  };

  const generateSlug = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleSubmit = async (data) => {
    try {
      const {
        name,
        short_description,
        description,
        price,
        status,
        category_id,
        brand_id,
        images,
        variants,
      } = data;

      const slug = generateSlug(name);

      // Upload ảnh
      const imageUrls = [];
      if (Array.isArray(images)) {
        for (const file of images) {
          const url = await uploadImageToCloudinary(file);
          imageUrls.push(url);
        }
      }

      const formattedVariants = Array.isArray(variants)
        ? variants.map((v) => ({
            name_color: v.name_color,
            code_color: v.code_color,
            quantity: Number(v.quantity) || 0,
            price: Number(v.price) || 0,
            discount: v.discount ? Number(v.discount) : null,
          }))
        : [];

      const payload = {
        name,
        short_description,
        description,
        price: Number(price),
        status: Boolean(Number(status)),
        category_id: Number(category_id),
        brand_id: Number(brand_id),
        images: imageUrls,
        slug,
        ...(formattedVariants.length > 0 && { variants: formattedVariants }),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể tạo sản phẩm");

      // Hiển thị modal success
      setSuccessMessage(" Thêm sản phẩm thành công!");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      // Hiển thị modal error
      setErrorMessage(error.message || "Đã xảy ra lỗi khi thêm sản phẩm.");
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/san-pham");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Thêm sản phẩm mới
      </h1>
      <ProductForm onSubmit={handleSubmit} />

      {/* Modal thành công */}
      <ModalSuccess
        isOpen={isSuccessOpen}
        onClose={handleSuccessClose}
        message={successMessage}
      />

      {/* Modal lỗi */}
      <ModalError
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default ProductCreate;
