"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "../../../components/Pagination";

const OrderList = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const displayStatus = {
    pending: "Chờ xác nhận",
    shipped: "Đang giao",
    delivered: "Hoàn tất",
    canceled: "Đã hủy",
  };
  const statusMap = {
    "Chờ xác nhận": "pending",
    "Đang giao": "shipped",
    "Hoàn tất": "delivered",
    "Đã hủy": "canceled",
  };
  const statusColor = {
    "Chờ xác nhận": "text-warning",
    "Đang giao": "text-primary",
    "Hoàn tất": "text-success",
    "Đã hủy": "text-danger",
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/order");
      const data = await res.json();

      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.error("Lỗi API:", data.error);
      }
    } catch (err) {
      console.error("Lỗi fetch:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((order) => {
    const matchSearch = order.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || order.status === statusMap[tab];
    return matchSearch && matchTab;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="pm-container container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="pm-title">Quản lý hóa đơn</h4>
      </div>

      <div className="d-flex gap-3 mb-3">
        <button className={`btn ${tab === "all" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => { setTab("all"); setCurrentPage(1); }}>Tất cả</button>
        <button className={`btn ${tab === "Chờ xác nhận" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => { setTab("Chờ xác nhận"); setCurrentPage(1); }}>Chờ xác nhận</button>
        <button className={`btn ${tab === "Đang giao" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => { setTab("Đang giao"); setCurrentPage(1); }}>Đang giao</button>
        <button className={`btn ${tab === "Hoàn tất" ? "btn-success" : "btn-outline-success"}`} onClick={() => { setTab("Hoàn tất"); setCurrentPage(1); }}>Hoàn tất</button>
        <button className={`btn ${tab === "Đã hủy" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => { setTab("Đã hủy"); setCurrentPage(1); }}>Đã hủy</button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo tên khách hàng..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="table-responsive">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            <table className="table table-bordered table-hover align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{startIndex + index + 1}</td>
                      <td className="text-start">{order.name}</td>
                      <td>{order.total_price?.toLocaleString() || 0}₫</td>
                      <td className={`fw-semibold ${statusColor[displayStatus[order.status]]}`}>
                        {displayStatus[order.status]}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link href={`/admin/hoa-don/${order.id}`} className="btn btn-sm btn-outline-info">Chi tiết</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-muted">Không tìm thấy hóa đơn phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              count={filtered.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;
