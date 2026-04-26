"use client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Link from 'next/link';

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        const res = await fetch("/api/account/passwordConfirm", {
            method: "POST",
            body: JSON.stringify({ email: data.email }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            toast.success("Vui lòng kiểm tra email để đặt lại mật khẩu!");
        } else {
            toast.error("Email không tồn tại hoặc có lỗi xảy ra.");
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
                        <span className="!mx-4 text-gray-900">Nhập email liên kết</span>
                        <hr className="flex-grow !border-t-2 border-gray-500" />
                    </div>

                    <form className="!space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-sm font-bold text-[#1f2438] !mb-1">Email tài khoản</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                className="w-full !px-3 !py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                {...register("email", {
                                    required: "Vui lòng nhập email",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Email không hợp lệ",
                                    },
                                })} />
                            {errors.email && <small className="text-red-600">{errors.email.message}</small>}
                        </div>



                        <button
                            type="submit"
                            className="w-full bg-[#1f2438] text-white !py-2 rounded hover:bg-[#031f4d] transition-colors"
                        >
                            Gửi liên kết
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
