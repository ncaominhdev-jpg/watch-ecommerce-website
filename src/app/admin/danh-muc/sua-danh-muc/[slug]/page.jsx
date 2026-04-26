"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryForm from "../../../../../form/CategoriesForm";
import constants from "../../../../../constants/constants";
import ModalSuccess from "../../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../../components/ModalError/ModalError";

const CategoryEditPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [defaultValues, setDefaultValues] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (!res.ok) throw new Error("Lỗi khi fetch danh mục");
        const data = await res.json();

        setCategoryId(Number(data.id));
        setDefaultValues({
          id: data.id,
          name: data.name,
          status: data.status ? "active" : "inactive",
          image: data.image,
          imageUrl: data.image,
        });

      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setErrorMessage("Không tìm thấy danh mục.");
        setIsErrorOpen(true);
      }
    };

    fetchCategory();
  }, [slug]);

  const handleUpdate = async (data, setError) => {
    try {
      let imageUrl = defaultValues.imageUrl;

      // Nếu có ảnh mới → upload
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", constants.UPLOAD_PRESET);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`,
          { method: "POST", body: cloudData }
        );

        const uploadResult = await uploadRes.json();
        if (!uploadResult.secure_url) throw new Error("Upload ảnh thất bại");

        imageUrl = uploadResult.secure_url;
      }

      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: categoryId,
          name: data.name,
          image: imageUrl, // luôn có ảnh
          status: data.status === "active",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error && result.error.includes("Tên danh mục")) {
          setError("name", { type: "server", message: result.error });
        } else {
          throw new Error(result.error || "Cập nhật thất bại");
        }
        return;
      }

      setSuccessMessage("✔️ Cập nhật danh mục thành công.");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      setErrorMessage("❌ Cập nhật danh mục thất bại.");
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/danh-muc");
  };

  if (!defaultValues)
    return <p className="p-4">⏳ Đang tải danh mục...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Cập nhật danh mục : {defaultValues.name}
      </h1>

      <CategoryForm
        onSubmit={handleUpdate}
        isEdit={true}
        defaultValues={defaultValues}
      />

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

export default CategoryEditPage;
