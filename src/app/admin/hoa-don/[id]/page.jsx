"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  function formatVietnamDateTime(dateString) {
    return new Date(dateString).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/account/orders/${id}/detail`);
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu hóa đơn");
        const data = await res.json();
        // Lưu trạng thái ban đầu để so sánh
        setOrder({ ...data.order, currentStatus: data.order.status });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetail();
  }, [id]);

  const statusOrder = ["pending", "shipped", "delivered", "canceled"];

  // Hàm kiểm tra trạng thái hợp lệ
  function canUpdateStatus(current, next) {
    const curIndex = statusOrder.indexOf(current);
    const nextIndex = statusOrder.indexOf(next);

    // Không cho phép lùi trạng thái (trừ canceled)
    if (nextIndex < curIndex && next !== "canceled") {
      return false;
    }

    // Cho phép hủy đơn ở bất kỳ trạng thái nào trừ khi đã giao hàng
    if (next === "canceled" && current !== "delivered") {
      return true;
    }

    // Cho phép giữ nguyên hoặc tiến lên
    return nextIndex >= curIndex;
  }

  const handleUpdateStatus = async () => {
    try {
      const nextStatus = order.status;
      const currentStatus = order.currentStatus;

      if (!canUpdateStatus(currentStatus, nextStatus)) {
        toast.warning("Không thể chuyển trạng thái lùi lại!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const res = await fetch(`/api/account/orders/${id}/detail`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");

      const result = await res.json();
      // Cập nhật lại currentStatus sau khi thành công
      setOrder({ ...order, currentStatus: nextStatus });

      toast.success(result.message || "Cập nhật trạng thái thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi tiết hóa đơn #{order.id}</h1>

      {/* Thông tin đơn hàng */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="mb-2">
          <strong>Ngày tạo:</strong> {formatVietnamDateTime(order.createdAt)}
        </div>
        <div className="mb-2">
          <strong>Trạng thái:</strong>
          <select
            className="ml-2 border border-gray-300 rounded px-2 py-1"
            value={order.status}
            onChange={(e) => setOrder({ ...order, status: e.target.value })}
          >
            {/* Trạng thái hiện tại */}
            <option value={order.status}>
              {order.status === "pending" && "Chờ xác nhận"}
              {order.status === "shipped" && "Đang giao"}
              {order.status === "delivered" && "Hoàn tất"}
              {order.status === "canceled" && "Đã hủy"}
            </option>

            {/* Nếu đang pending */}
            {order.status === "pending" && (
              <>
                <option value="shipped">Đang giao</option>
                <option value="canceled">Đã hủy</option>
              </>
            )}

            {/* Nếu đang shipped */}
            {order.status === "shipped" && (
              <>
                <option value="delivered">Hoàn tất</option>
                <option value="canceled">Đã hủy</option>
              </>
            )}

            {/* Nếu đang delivered → không cho chọn khác */}
            {/* Nếu đang canceled → không cho chọn khác */}
          </select>

        </div>
      </div>

      {/* Thông tin khách hàng và giao hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Thông tin khách hàng</h2>
          <div><strong>Họ tên:</strong> {order.customer.name}</div>
          <div><strong>Email:</strong> {order.customer.email}</div>
          <div><strong>Số điện thoại:</strong> {order.customer.phone}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Thông tin giao hàng</h2>
          <div><strong>Người nhận:</strong> {order.name}</div>
          <div><strong>Số điện thoại:</strong> {order.phone}</div>
          <div><strong>Địa chỉ:</strong> {order.address}</div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Sản phẩm đã đặt</h2>
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">Sản phẩm</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Số lượng</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Đơn giá</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2">{item.productName}</td>
                <td className="border border-gray-300 px-3 py-2">{item.quantity}</td>
                <td className="border border-gray-300 px-3 py-2">{item.price.toLocaleString()}₫</td>
                <td className="border border-gray-300 px-3 py-2">
                  {(item.price * item.quantity).toLocaleString()}₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tổng tiền và nút cập nhật */}
      <div className="bg-white p-4 rounded shadow flex items-center justify-between">
        <div className="text-xl font-bold">
          Tổng cộng: {order.total_price.toLocaleString()}₫
        </div>
        <div>
          <button
            onClick={handleUpdateStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Cập nhật trạng thái
          </button>
        </div>
      </div>
    </div>
  );
}
