'use client';
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";

function Contact() {
    const { register, reset, handleSubmit, formState: { errors } } = useForm({
        mode: "onTouched",
    });

    const hadleContact = async (formData) => {
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    title: formData.title,
                    message: formData.question,
                }),
            });

            if (res.ok) {
                toast.success("Yêu cầu đã được gửi thành công!");
                reset();
            } else {
                const data = await res.json();
                toast.error(data?.error || "Gửi yêu cầu thất bại!");
            }
        } catch (err) {
            toast.error("Lỗi kết nối đến server!");
        }
    };


    return (
        <main className="!w-[80%] !mx-auto !p-8 !bg-white !shadow-lg !rounded-lg !my-5">
            <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-3">
                   <section className="lg:!p-4 !p-2 !py-1">
                    <h2 className="!text-2xl !font-bold !text-blue-950 !pb-3">Câu hỏi thường gặp</h2>
                    <hr className="!border-gray-400 !border-2 !my-2" />
                    <div className="!space-y-3">
                        <details className="!border !border-gray-300 !p-2 !rounded-md !bg-gray-50">
                            <summary className="!cursor-pointer !font-semibold !text-lg !text-gray-800">
                                Làm thế nào để đặt mua đồng hồ?
                            </summary>
                            <p className="!mt-3 !text-gray-700 !leading-relaxed">
                                Bạn có thể đặt mua trực tuyến qua website của chúng tôi hoặc gọi trực tiếp đến hotline để được hỗ trợ.
                            </p>
                        </details>
                        <details className="!border !border-gray-300 !p-2 !rounded-md !bg-gray-50">
                            <summary className="!cursor-pointer !font-semibold !text-lg !text-gray-800">
                                Tôi có thể đổi trả đồng hồ sau khi mua không?
                            </summary>
                            <p className="!mt-3 !text-gray-700 !leading-relaxed">
                                Có, bạn có thể đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm bị lỗi do nhà sản xuất.
                            </p>
                        </details>
                        <details className="!border !border-gray-300 !p-2 !rounded-md !bg-gray-50">
                            <summary className="!cursor-pointer !font-semibold !text-lg !text-gray-800">
                                Đồng hồ có được bảo hành không?
                            </summary>
                            <p className="!mt-3 !text-gray-700 !leading-relaxed">
                                Tất cả sản phẩm đều được bảo hành từ 12 - 24 tháng tùy theo từng hãng đồng hồ.
                            </p>
                        </details>
                        <details className="!border !border-gray-300 !p-2 !rounded-md !bg-gray-50">
                            <summary className="!cursor-pointer !font-semibold !text-lg !text-gray-800">
                                Hình thức thanh toán như thế nào?
                            </summary>
                            <p className="!mt-3 !text-gray-700 !leading-relaxed">
                                Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng và thanh toán qua ví điện tử.
                            </p>
                        </details>
                    </div>
                </section>

                <section className="!p-2 lg:!p-4">
                    <h2 className="!text-2xl !font-bold !text-blue-950 !pb-3">Liên hệ hỗ trợ</h2>
                    <hr className="!border-gray-400 !border-2 !my-2" />

                    <form onSubmit={handleSubmit(hadleContact)} className="lg:!space-y-3 !space-y-1">
                        <div>
                            <label className="!block !text-gray-800 !font-semibold !mb-2">Chủ đề quan tâm</label>
                            <input
                                type="text"
                                placeholder="Nhập tiêu đề"
                                className={`!w-full !p-2 !border !rounded-lg !focus:ring-2 ${errors.title
                                    ? '!border-red-500 !focus:ring-red-500'
                                    : '!border-gray-300 !focus:ring-blue-500'
                                    }`}
                                {...register('title', {
                                    required: 'Vui lòng nhập tiêu đề',
                                    minLength: {
                                        value: 2,
                                        message: 'Tiêu đề phải có ít nhất 2 ký tự',
                                    },
                                })}
                            />
                            {errors.title && <span className="!text-red-500 !text-sm">{errors.title.message}</span>}
                        </div>
                        <div>
                            <label className="!block !text-gray-800 !font-semibold !mb-2">Tên của bạn</label>
                            <input
                                type="text"
                                placeholder="Nhập tên của bạn"
                                className={`!w-full !p-2 !border !rounded-lg !focus:ring-2 ${errors.fullName
                                    ? '!border-red-500 !focus:ring-red-500'
                                    : '!border-gray-300 !focus:ring-blue-500'
                                    }`}
                                {...register('fullName', {
                                    required: 'Vui lòng nhập tên',
                                    minLength: {
                                        value: 2,
                                        message: 'Tên phải có ít nhất 2 ký tự',
                                    },
                                })}
                            />
                            {errors.fullName && <span className="!text-red-500 !text-sm">{errors.fullName.message}</span>}
                        </div>

                        <div>
                            <label className="!block !text-gray-800 !font-semibold !mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                className={`!w-full !p-2 !border !rounded-lg !focus:ring-2 ${errors.email
                                    ? '!border-red-500 !focus:ring-red-500'
                                    : '!border-gray-300 !focus:ring-blue-500'
                                    }`}
                                {...register('email', {
                                    required: 'Vui lòng nhập email',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: 'Email không hợp lệ',
                                    },
                                })}
                            />
                            {errors.email && <span className="!text-red-500 !text-sm">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="!block !text-gray-800 !font-semibold !mb-2">Nội dung hỗ trợ</label>
                            <textarea
                                rows="4"
                                placeholder="Nhập nội dung cần hỗ trợ..."
                                className={`!w-full !p-2 !border !rounded-lg !focus:ring-2 ${errors.question
                                    ? '!border-red-500 !focus:ring-red-500'
                                    : '!border-gray-300 !focus:ring-blue-500'
                                    }`}
                                {...register('question', {
                                    required: 'Vui lòng nhập nội dung',
                                })}
                            />
                            {errors.question && <span className="!text-red-500 !text-sm">{errors.question.message}</span>}
                        </div>

                        <button
                            type="submit"
                            className="!w-full !bg-[#1F2438] !text-white !py-2 !rounded !hover:bg-green-950 !font-semibold"
                        >
                            Gửi yêu cầu
                        </button>
                    </form>
                </section>
            </div>

            <section className="!mt-8 !text-gray-800 !text-center !border-t !border-gray-300">
                <h2 className="!text-3xl !font-bold !text-green-950 !mb-6 !mt-8 !pb-2">Thông tin liên hệ</h2>
                <iframe
                    src="https://www.google.com/maps/embed?pb=..."
                    width="100%"
                    height="400px"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="!w-full"
                ></iframe>
                <p>Email: <a href="#" className="!text-blue-500">hotrowebsite.com</a></p>
                <p>Hotline: <a href="tel:18001000" className="!text-blue-500">1800 1000</a></p>
                <p>Địa chỉ: Cái Răng, Cần Thơ.</p>
            </section>
        </main>

    )
}

export default Contact;