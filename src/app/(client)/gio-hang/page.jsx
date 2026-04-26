"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

export default function Cart() {
    const [checkedItems, setCheckedItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('jwt-datt');
        if (!token) {
            router.push("/dang-nhap");
            return;
        }

        const fetchCart = async () => {
            try {
                const res = await fetch("/api/cart");
                const data = await res.json();
                setCartItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi khi lấy giỏ hàng:", error);
                setCartItems([]); // fallback
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleThanhToan = () => {
        const selectedItems = cartItems.filter(item => checkedItems.includes(item.id));
        localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
        router.push("/thanh-toan");
    };

    const handleDelete = async (user_id, product_variant_id) => {
        try {
            const res = await fetch("/api/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, product_variant_id }),
            });

            if (!res.ok) throw new Error("Xóa sản phẩm thất bại");

            setCartItems(prev =>
                prev.filter(item => !(item.user_id === user_id && item.product_variant_id === product_variant_id))
            );
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };

    const TinhTien = async (index, change) => {
        const updatedItems = [...cartItems];
        const item = updatedItems[index];
        let qty = item.quantity + change;
        if (qty < 1) qty = 1;
        item.quantity = qty;
        setCartItems(updatedItems);

        try {
            await fetch("/api/cart", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: item.user_id,
                    product_variant_id: item.product_variant_id,
                    quantity: qty,
                }),
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
        }
    };

    const formatCurrency = (value) => value?.toLocaleString("vi-VN") + " VNĐ";

    const handleCheck = (id) => {
        setCheckedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const totalChecked = cartItems.reduce((total, item) => {
        if (checkedItems.includes(item.id)) {
            const price = item.variant?.price - (item.variant?.discount || 0);
            return total + price * item.quantity;
        }
        return total;
    }, 0);

    if (loading) return <div className="text-center py-10">Đang tải giỏ hàng...</div>;

    return (
        <main className="w-[80%] !mx-auto !py-8 relative">
            <h3 className="!text-3xl !font-bold !text-center !text-[#1F2438] !mb-6">Giỏ hàng của bạn</h3>

            <div className="overflow-x-auto shadow-md rounded border border-gray-200">
                <table className="min-w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-[#1F2438] text-white">
                            <th className="!py-2 text-center px-3"></th>
                            <th className="!py-2 text-center px-3">STT</th>
                            <th className="!py-2 text-center px-3">Ảnh</th>
                            <th className="!py-2 text-center px-3">Tên sản phẩm</th>
                            <th className="!py-2 text-center px-3">Loại</th>
                            <th className="!py-2 text-center px-3">Giá</th>
                            <th className="!py-2 text-center px-3">Số lượng</th>
                            <th className="!py-2 text-center px-3">Thành tiền</th>
                            <th className="!py-2 text-center px-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => (
                            <tr key={item.id} className="text-center border-t hover:bg-gray-50 transition">
                                <td className="!py-2">
                                    <input
                                        type="checkbox"
                                        checked={checkedItems.includes(item.id)}
                                        onChange={() => handleCheck(item.id)}
                                    />
                                </td>
                                <td className="!py-2">{index + 1}</td>
                                <td className="!py-2">
                                    <img
                                        src={item.product?.product_images?.[0]?.image_url || "/placeholder.png"}
                                        alt={item.product?.name || "Sản phẩm"}
                                        className="w-16 h-16 object-cover !mx-auto rounded"
                                    />
                                </td>
                                <td className="!py-2 font-semibold text-[#1F2438]">
                                    {item.product?.name || "Không rõ"}
                                </td>
                                <td className="!py-2">{item.variant?.name_color || "Không rõ"}</td>
                                <td className="!py-2 text-orange-700">
                                    <div className="flex flex-col items-center">
                                        <span className="line-through text-gray-400 text-sm">
                                            {formatCurrency(item.variant?.price)}
                                        </span>
                                        <span className="text-orange-700 font-semibold">
                                            {formatCurrency(item.variant?.price - (item.variant?.discount || 0))}
                                        </span>
                                    </div>
                                </td>
                                <td className="!py-2">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => TinhTien(index, -1)}
                                            className="!px-2 !py-1 !bg-orange-200 hover:bg-orange-300 rounded"
                                        >-</button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            readOnly
                                            className="w-12 text-center border rounded"
                                        />
                                        <button
                                            onClick={() => TinhTien(index, 1)}
                                            className="!px-2 !py-1 !bg-orange-200 hover:bg-orange-300 rounded"
                                        >+</button>
                                    </div>
                                </td>
                                <td className="!py-2 !text-green-800 font-semibold">
                                    {formatCurrency(
                                        (item.variant?.price - (item.variant?.discount || 0)) * item.quantity
                                    )}
                                </td>
                                <td>
                                    <button className="border border-black rounded-sm !p-2"
                                        onClick={() => handleDelete(item.user_id, item.product_variant_id)}
                                    >Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md !py-2 !px-6 !mt-6 flex flex-col md:flex-row items-center justify-between z-50">
                <div className="text-lg font-semibold text-[#1F2438]">
                    Tổng tiền ({checkedItems.length} sản phẩm):{" "}
                    <span className="text-orange-600">{formatCurrency(totalChecked)}</span>
                </div>
                <button
                    onClick={handleThanhToan}
                    disabled={checkedItems.length === 0}
                    className={`!mt-2 md:mt-0 !px-6 !py-2 rounded font-semibold text-white transition ${checkedItems.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-700 hover:bg-orange-800"
                        }`}
                >
                    Thanh toán
                </button>
            </div>
        </main>
    );
}
