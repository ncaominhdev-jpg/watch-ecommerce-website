"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";


export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword((prev) => !prev);


    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch("password");

    const onSubmit = async (data) => {
        const token = new URLSearchParams(window.location.search).get('token');

        const res = await fetch(`/api/account/passwordConfirm?token=${token}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                newPassword: data.password
            })
        });

        if (res.ok) {
            toast.success("Đổi mật khẩu thành công!");
            router.push('/dang-nhap');
        } else {
            const { error } = await res.json();
            toast.error(error);
        }
    };



    if (!token) {
        return <p className="text-center text-red-600">Token không hợp lệ.</p>;
    }

    return (
        <main className="flex items-center justify-center h-screen">
            <div className="lg:w-full w-[95%] max-w-md bg-white !p-4 lg:p-9  rounded-xl shadow-xl mx-auto">
                <div className="flex justify-center items-center w-full !mb-6">
                    <Link href="/">
                        <img src="/image/main/logonight.jpg" className="max-w-[150px]" alt="logo" />
                    </Link>
                </div>
                <div className="flex items-center justify-center !my-4 lg:my-9">
                    <hr className="flex-grow !border-t-2 border-gray-400" />
                    <span className="!mx-4 text-gray-900">Đặt lại tài khoản</span>
                    <hr className="flex-grow !border-t-2 border-gray-500" />
                </div>

                <form className="!space-y-4" onSubmit={handleSubmit(onSubmit)}>

                    <div>
                        <label className="block text-sm font-bold text-[#1f2438] !mb-1">Mật khẩu</label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="peer w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập mật khẩu"
                                {...register("password", {
                                    required: "Vui lòng nhập mật khẩu",
                                    pattern: {
                                        value: /^(?=.*[A-Z]).{6,}$/,
                                        message: "Mật khẩu phải có ít nhất 6 ký tự và 1 chữ cái viết hoa",
                                    },
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
                        {errors.password && <small className="text-red-600">{errors.password.message}</small>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#1f2438] !mb-1">Nhập lại mật khẩu</label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="peer w-full !px-3 !py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập lại mật khẩu"
                                {...register("confirmPassword", {
                                    required: "Vui lòng nhập lại mật khẩu",
                                    validate: (value) =>
                                        value === password || "Mật khẩu nhập lại không khớp",
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
                        {errors.confirmPassword && <small className="text-red-600">{errors.confirmPassword.message}</small>}
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-[#1f2438] text-white !py-2 rounded hover:bg-[#031f4d] transition-colors"
                    >
                        Đặt lại mật khẩu
                    </button>
                </form>

                <p className="text-center text-sm !mt-4">
                    Bạn muốn đăng nhập?{" "}
                    <Link href="/dang-nhap" className="text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </p>

            </div>
        </main>
    );
}

