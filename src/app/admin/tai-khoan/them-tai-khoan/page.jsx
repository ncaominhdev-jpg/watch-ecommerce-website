"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import UserForm from "../../../../form/UserForm";
import { useRouter } from "next/navigation";
import ModalSuccess from "../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../components/ModalError/ModalError";

const UserCreate = () => {
  const methods = useForm();
  const router = useRouter();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async (data) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result?.error === "Email đã tồn tại trong hệ thống") {
          methods.setError("email", {
            type: "server",
            message: result.error,
          });
          return;
        }

        throw new Error(result.error || "Lỗi không xác định");
      }

      setSuccessMessage("✔️ Thêm người dùng thành công!");
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("Lỗi:", err);
      setErrorMessage("❌ Đã xảy ra lỗi khi gửi dữ liệu.");
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/tai-khoan");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 ring-1 ring-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Thêm người dùng mới
      </h1>

      <FormProvider {...methods}>
        <UserForm onSubmit={handleCreate} />
      </FormProvider>

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

export default UserCreate;
