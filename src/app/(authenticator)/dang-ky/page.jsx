"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from 'next/link';
function Register() {
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
        mode: "onChange",
    });

    const [serverError, setServerError] = useState("");

    const password = watch("password", "");

    const handleRegister = async (data) => {
        setServerError(""); 
        try {
            const { confirmPassword, ...registerData } = data;

            const response = await fetch("/api/account/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Đăng ký thành công!");
                window.location.href = "/dang-nhap";
            } else {
               
                setServerError(result.message || "Đăng ký thất bại");
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            setServerError("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
    };


    return (
        <main className="flex items-center justify-center h-screen">
            <div className="lg:w-full w-[95%] max-w-md bg-white !p-3 lg:p-4 rounded-xl shadow-xl mx-auto">
                <div className="!px-2 !p-4">
                    <div className="flex justify-center items-center w-full !mb-6">
                        <Link href="/">
                            <img src="/image/main/logonight.jpg" className="max-w-[150px]" alt="logo" />
                        </Link>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button className="flex items-center justify-center w-full border border-gray-400 rounded !py-2 hover:bg-gray-100">
                            <img src="/image/icon/google.png" alt="google" className="w-4 h-4 !mr-2" />
                            <span>Đăng ký bằng Google</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-center !my-4 !lg:my-9">
                        <hr className="flex-grow !border-t-2 border-gray-400" />
                        <span className="!mx-4 text-gray-900">Đăng ký tài khoản</span>
                        <hr className="flex-grow !border-t-2 border-gray-500" />
                    </div>

                    <form className="!space-y-4" onSubmit={handleSubmit(handleRegister)}>
                        <div>
                            <label className="block text-sm font-bold text-[#1f2438] !mb-1">Họ và tên</label>
                            <input
                                type="text"
                                className="w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập họ và tên"
                                {...register("name", { required: "Vui lòng nhập họ và tên" })}
                            />
                            {errors.name && <small className="text-red-600">{errors.name.message}</small>}
                        </div>

                        {/* <div>
                            <label className="block text-sm font-bold text-[#1f2438] !mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                className="w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập số điện thoại"
                                {...register("phone", {
                                    required: "Vui lòng nhập số điện thoại",
                                    pattern: {
                                        value: /^[0-9]{9,11}$/,
                                        message: "Số điện thoại không hợp lệ",
                                    },
                                })}
                            />
                            {errors.phone && <small className="text-red-600">{errors.phone.message}</small>}
                        </div> */}


                        <div>
                            <label className="block text-sm font-bold text-[#1f2438] !mb-1">Email</label>
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
                            {errors.email && <small className="text-red-600">{errors.email.message}</small>}
                            {serverError && (
                                <div className=" text-red-600 font-medium text-sm mt-2">
                                    {serverError}
                                </div>
                            )}

                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1f2438] !mb-1">Mật khẩu</label>
                            <input
                                type="password"
                                className="w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập mật khẩu"
                                {...register("password", {
                                    required: "Vui lòng nhập mật khẩu",
                                    minLength: {
                                        value: 6,
                                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                                    },
                                })}
                            />
                            {errors.password && <small className="text-red-600">{errors.password.message}</small>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1f2438] !mb-1">Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                className="w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập lại mật khẩu"
                                {...register("confirmPassword", {
                                    required: "Vui lòng nhập lại mật khẩu",
                                    validate: value =>
                                        value === password || "Mật khẩu nhập lại không khớp",
                                })}
                            />
                            {errors.confirmPassword && <small className="text-red-600">{errors.confirmPassword.message}</small>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#1f2438] text-white !py-2 rounded hover:bg-[#031f4d] transition-colors"
                        >
                            Đăng ký
                        </button>


                    </form>

                    <p className="text-center text-sm !mt-4">
                        Bạn đã có tài khoản?{" "}
                        <Link href="/dang-nhap" className="text-blue-600 hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                    <p className="text-center text-sm !mt-1">
                        Quên mật khẩu?{" "}
                        <Link href="/forgot-password" className="text-blue-600 hover:underline">
                            Đặt lại mật khẩu
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Register;
