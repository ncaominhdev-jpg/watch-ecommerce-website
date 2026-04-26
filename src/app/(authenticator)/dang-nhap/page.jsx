"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const router = useRouter();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async (data) => {
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Đăng nhập thành công");
        if (result.user.role === "admin") {
          return router.push("/admin");
        } else if (result.user.role === "super_admin") {
          return router.push("/admin");
        } else {
          return router.push("/");
        }
      } else {
        
        setServerError(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setServerError("Đã xảy ra lỗi vui lòng thử lại sau.");
    }
  };

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="lg:w-full lg:max-w-md bg-white lg:p-9 !p-3 !my-[50px] rounded-xl !shadow-xl !mx-auto">
        <div className="!px-2   !p-4">
          <div className="flex justify-center items-center w-full !mb-6">
            <Link href="/">
              <img src="/image/main/logonight.jpg" className="max-w-[150px]" alt="logo" />
            </Link>
          </div>

          <div className="flex !lg:gap-4 lg:mb-6">
            <button className="flex items-center justify-center w-full border border-gray-400 rounded !py-2 hover:bg-gray-100">
              <img
                src="/image/icon/google.png"
                alt="google"
                className="w-4 h-4 !mr-2"
              />
              <span>Đăng nhập bằng Google</span>
            </button>
          </div>

          <div className="flex items-center justify-center !my-4 !lg:my-9">
            <hr className="flex-grow !border-t-2 border-gray-400" />
            <span className="!mx-4 text-gray-900">
              Hoặc đăng nhập bằng email
            </span>
            <hr className="flex-grow !border-t-2 border-gray-500" />
          </div>

          <form className="!space-y-4" onSubmit={handleSubmit(handleLogin)}>
            <div>
              <label className="block text-sm font-bold text-[#1f2438] !mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập email"
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <small className="text-red-600">{errors.email.message}</small>
              )}
              {serverError && (
                <div className="text-red-600 text-sm mt-3 text-left">
                  {serverError}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1f2438] !mb-1">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="peer w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập mật khẩu"
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                  })}
                />

                <div
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </div>
              </div>
              {errors.password && (
                <small className="text-red-600">{errors.password.message}</small>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1f2438] text-white !py-2 rounded hover:bg-[#031f4d] transition-colors"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm !mt-4">
            Bạn chưa có tài khoản?{" "}
            <Link href="/dang-ky" className="text-blue-600 hover:underline">
              Đăng ký
            </Link>
          </p>
          <p className="text-center text-sm !mt-1">
            Quên mật khẩu?{" "}
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Đặt lại mật khẩu
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
