"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CategoryForm from "../../../../form/CategoriesForm";
import constants from "../../../../constants/constants";
import ModalSuccess from "../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../components/ModalError/ModalError";

export default function ThemDanhMucPage() {
  const router = useRouter();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async (data, setError) => {
    try {
      // 1. Upload ảnh lên Cloudinary
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

      // 2. Gửi dữ liệu về API
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          image: uploadResult.secure_url,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        // 🔴 Nếu lỗi trùng tên
        if (result.error && result.error.includes("Tên danh mục")) {
          setError("name", { type: "server", message: result.error });
        } else {
          throw new Error(result.error || "Tạo thất bại");
        }
        return;
      }

      setSuccessMessage("✔️ Thêm danh mục thành công.");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      setErrorMessage("❌ Không thể tạo danh mục.");
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/danh-muc");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Thêm danh mục mới
      </h1>

      <CategoryForm onSubmit={handleCreate} isEdit={false} />

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
}
