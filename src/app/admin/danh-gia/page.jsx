'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import FormDelete from "../../../components/formDelete/index";
import ModalConfirmStatus from "../../../components/ModalConfirmStatus/ModalConfirmStatus";

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedReview, setSelectedReview] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedReview) return;

    try {
      const res = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !selectedReview.status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReviews(prev =>
        prev.map(r => (r.id === selectedReview.id ? { ...r, status: !selectedReview.status } : r))
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err.message);
    } finally {
      setSelectedReview(null);
      setIsConfirmOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      const res = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
    } catch (err) {
      console.error("Lỗi khi xoá đánh giá:", err.message);
    } finally {
      setSelectedReview(null);
      setIsDeleteOpen(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "active" && r.status) ||
      (statusFilter === "inactive" && !r.status);
    const matchSearch =
      r.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.product.name?.toLowerCase().includes(search.toLowerCase());
    const matchRating =
      ratingFilter === "" || r.rating === parseInt(ratingFilter);

    return matchStatus && matchSearch && matchRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / limit);
  const paginated = filteredReviews.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, ratingFilter]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6 max-w-7xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="pm-title">Quản lý đánh giá</h4>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo khách hàng hoặc sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hiển thị</option>
            <option value="inactive">Đã ẩn</option>
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">Tất cả số sao</option>
            {[5, 4, 3, 2, 1].map(star => (
              <option key={star} value={star}>{star} sao</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p className="text-muted">Đang tải đánh giá...</p>
        ) : (
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Số sao</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((r, index) => (
                  <tr key={r.id}>
                    <td>{(page - 1) * limit + index + 1}</td>
                    <td>{r.user?.name || 'Ẩn danh'}</td>
                    <td>{r.product?.name}</td>
                    <td>{r.rating} ⭐</td>
                    <td className={r.status ? 'text-success fw-bold' : 'text-muted fst-italic'}>
                      {r.status ? 'Hiển thị' : 'Đã ẩn'}
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <Link
                        href={`/admin/danh-gia/${r.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Xem
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => {
                          setSelectedReview(r);
                          setIsConfirmOpen(true);
                        }}
                      >
                        {r.status ? "Ẩn" : "Hiện"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedReview(r);
                          setIsDeleteOpen(true);
                        }}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-muted">Không có đánh giá phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="d-flex justify-content-center align-items-center my-3">
        <button className="btn btn-outline-primary me-2" disabled={page === 1} onClick={() => setPage(page - 1)}>Trang trước</button>
        <span>Trang {page} / {totalPages}</span>
        <button className="btn btn-outline-primary ms-2" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Trang sau</button>
      </div>

      <FormDelete
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        message={`Bạn có chắc chắn muốn xoá đánh giá của khách hàng "${selectedReview?.user?.name}"?`}
      />
      <ModalConfirmStatus
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        message={`Bạn có chắc chắn muốn ${selectedReview?.status ? 'ẩn' : 'hiện'} đánh giá của khách hàng "${selectedReview?.user?.name}"?`}
      />
    </div>
  );
}
