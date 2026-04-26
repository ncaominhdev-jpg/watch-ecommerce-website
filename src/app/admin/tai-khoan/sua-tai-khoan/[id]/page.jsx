"use client";
import React, { useEffect, useState } from "react";
import UserForm from "../../../../../form/UserForm";
import { useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import ModalSuccess from "../../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../../components/ModalError/ModalError";

const UserEdit = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null); // ✅ thêm state để lưu role người đăng nhập
  const [loading, setLoading] = useState(true);
  const methods = useForm();
  const router = useRouter();

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [profileRes, userRes] = await Promise.all([
          fetch("/api/account/profile", { credentials: "include" }),
          fetch(`/api/users/${id}`),
        ]);

        if (!profileRes.ok || !userRes.ok) throw new Error("Không thể load dữ liệu");

        const profileData = await profileRes.json();
        const currentUser = profileData.user;
        const targetUser = await userRes.json();

        // ✅ lưu lại role của người đăng nhập
        setCurrentUserRole(currentUser.role);

        // Nếu là admin thì chỉ cho phép sửa khách hàng
        if (currentUser?.role === "admin" && targetUser.role !== "customers") {
          router.push("/admin/tai-khoan");
          return;
        }

        setUser(targetUser);
        methods.reset(targetUser);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
        setUser(null);
        setErrorMessage("Không tìm thấy người dùng hoặc không có quyền truy cập.");
        setIsErrorOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Cập nhật thất bại");
      }

      setSuccessMessage("✅ Cập nhật người dùng thành công!");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      setErrorMessage("❌ " + error.message);
      setIsErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    router.push("/admin/tai-khoan");
  };

  if (loading) return <p className="text-gray-500">Đang tải dữ liệu...</p>;
  if (!user) return <p className="text-red-600">Không tìm thấy người dùng</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Cập nhật tài khoản: {user.name || "Không có tên"}
      </h2>
      <FormProvider {...methods}>
        <UserForm 
          onSubmit={handleUpdate} 
          isEdit={true} 
          currentUserRole={currentUserRole} // ✅ dùng role của người đăng nhập
        />
      </FormProvider>

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

export default UserEdit;
