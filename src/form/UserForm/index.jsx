"use client";
import React from "react";
import { useFormContext } from "react-hook-form";

const UserForm = ({ onSubmit, isEdit = false, currentUserRole }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useFormContext();

    const password = watch("password");

    // Chỉ super_admin mới có quyền sửa role
    const canEditRole = currentUserRole === "super_admin";

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Họ tên */}
            <div>
                <label className="block mb-1 font-medium text-gray-700">Họ tên</label>
                <input
                    type="text"
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                    {...register("name", { required: "Vui lòng nhập họ tên" })}
                />
                {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                    {...register("email", {
                        required: "Email không được để trống",
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Email không hợp lệ",
                        },
                    })}
                />
                {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
            </div>

            {/* Số điện thoại */}
            <div>
                <label className="block mb-1 font-medium text-gray-700">Số điện thoại</label>
                <input
                    type="text"
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                    {...register("phone", {
                        required: "Vui lòng nhập số điện thoại",
                        pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: "Số điện thoại không hợp lệ",
                        },
                    })}
                />
                {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
            </div>

            {/* Mật khẩu (chỉ khi tạo mới) */}
            {!isEdit && (
                <>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.password ? "border-red-500" : "border-gray-300"
                                }`}
                            {...register("password", {
                                required: "Vui lòng nhập mật khẩu",
                                minLength: { value: 6, message: "Ít nhất 6 ký tự" },
                            })}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                }`}
                            {...register("confirmPassword", {
                                required: "Vui lòng xác nhận mật khẩu",
                                validate: (value) =>
                                    value === password || "Mật khẩu không khớp",
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* Vai trò */}
            <div>
                <label className="block mb-1 font-medium text-gray-700">Vai trò</label>
                <select
                    disabled={!canEditRole} // 🔒 chỉ super_admin mới chỉnh
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.role ? "border-red-500" : "border-gray-300"
                        } ${!canEditRole ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    {...register("role", {
                        required: "Vui lòng chọn vai trò",
                    })}
                >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Nhân viên</option>
                    <option value="customers">Khách hàng</option>
                </select>
                {errors.role && (
                    <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                )}
                {!canEditRole && (
                    <p className="text-xs text-gray-500 mt-1">
                        Chỉ Super Admin mới có thể thay đổi vai trò.
                    </p>
                )}
            </div>

            {/* Nút submit */}
            <div>
                <button
                    type="submit"
                    className="w-full bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800 transition mt-4"
                >
                    {isEdit ? "Cập nhật người dùng" : "Thêm người dùng"}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
