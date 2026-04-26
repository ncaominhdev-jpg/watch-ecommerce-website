"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "../../../../../form/ProductForm";
import { toast } from "react-toastify";
import ModalSuccess from "../../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../../components/ModalError/ModalError";

const ProductEdit = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [defaultValues, setDefaultValues] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();

        if (res.ok) {
          const mappedData = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            short_description: data.short_description,
            description: data.description,
            price: data.price,
            status: data.status ? "1" : "0",
            category_id: data.category_id?.toString(),
            brand_id: data.brand_id?.toString(),
            images: data.product_images?.map((img) => img.image_url) || [],
            variants: data.product_variants || [],
          };
          setDefaultValues(mappedData);
        } else {
          setErrorMessage(data.error || "Không tìm thấy sản phẩm.");
          setIsErrorOpen(true);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setErrorMessage("Không thể tải dữ liệu sản phẩm.");
        setIsErrorOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const handleSubmit = async (data) => {
    try {
      const payload = { ...data, id: defaultValues.id };
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Cập nhật thất bại");

      toast.success(" Cập nhật sản phẩm thành công!");
      router.push("/admin/san-pham");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      toast.error(" Lỗi khi cập nhật sản phẩm.");
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/san-pham");
  };

  if (loading) return <p>Đang tải dữ liệu sản phẩm...</p>;
  if (!defaultValues) return <p>Không tìm thấy dữ liệu sản phẩm.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Chỉnh sửa sản phẩm
      </h1>

      <ProductForm onSubmit={handleSubmit} defaultValues={defaultValues} isEdit={true} />

      {/* Modal Success */}
      <ModalSuccess
        isOpen={isSuccessOpen}
        onClose={handleSuccessClose}
        message={successMessage}
      />

      {/* Modal Error */}
      <ModalError
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default ProductEdit;
