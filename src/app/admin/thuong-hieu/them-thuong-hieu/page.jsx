"use client";
import { useRouter } from "next/navigation";
import BrandForm from "../../../../form/BrandForm";
import constants from "../../../../constants/constants";
import { useState } from "react";
import ModalSuccess from "../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../components/ModalError/ModalError";

const BrandCreate = () => {
  const router = useRouter();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async (data, setError) => {
    try {
      const file = data.logo[0];
      const cloudData = new FormData();
      cloudData.append("file", file);
      cloudData.append("upload_preset", constants.UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudData,
        }
      );

      const uploadResult = await uploadRes.json();
      if (!uploadResult.secure_url) throw new Error("Upload ảnh thất bại");

       const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          logo_url: uploadResult.secure_url,
          status: data.status === "true" || data.status === true,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error && result.error.includes("Tên thương hiệu")) {
          setError("name", { type: "server", message: result.error });
        } else {
          throw new Error(result.error || "Tạo thương hiệu thất bại");
        }
        return;
      }

      setSuccessMessage("Thêm thương hiệu thành công");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Lỗi khi tạo thương hiệu:", error);
      setErrorMessage("Không thể tạo thương hiệu");
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/thuong-hieu");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Thêm thương hiệu mới
      </h1>
      <BrandForm onSubmit={handleCreate} isEdit={false} />

       <ModalSuccess
        isOpen={isSuccessOpen}
        onClose={handleSuccessClose}
        message={successMessage}
      />

       <ModalError
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default BrandCreate;
