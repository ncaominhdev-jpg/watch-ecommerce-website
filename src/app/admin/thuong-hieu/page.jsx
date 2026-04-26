'use client';
import { useState, useEffect } from "react";
import Link from 'next/link';
import FormDelete from "../../../components/formDelete";
import ModalSuccess from "../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../components/ModalError/ModalError";
import ModalConfirmStatus from "../../../components/ModalConfirmStatus/ModalConfirmStatus";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteBrand, setDeleteBrand] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brands');
      if (!res.ok) throw new Error("Lỗi khi tải thương hiệu");
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Không thể tải danh sách thương hiệu.");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (brand) => {
    setDeleteBrand(brand);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBrand) return;

    try {
      const res = await fetch("/api/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteBrand.id }),
      });

      const result = await res.json();

      if (res.ok) {
        setBrands(prev => prev.filter(b => b.id !== deleteBrand.id));
        setSuccessMessage(`Đã xoá thương hiệu "${deleteBrand.name}" thành công.`);
        setIsSuccessOpen(true);
      } else {
        setErrorMessage(result.error || "Không thể xoá thương hiệu.");
        setIsErrorOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      setErrorMessage("Xoá thương hiệu thất bại.");
      setIsErrorOpen(true);
    } finally {
      setIsDeleteOpen(false);
      setDeleteBrand(null);
    }
  };

  const openConfirmModal = (brand) => {
    setSelectedBrand(brand);
    setIsConfirmOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedBrand) return;

    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBrand.id,
          name: selectedBrand.name,
          description: selectedBrand.description,
          logo_url: selectedBrand.logo_url,
          status: !selectedBrand.status,
        }),
      });

      const updated = await res.json();

      if (res.ok) {
        setBrands(prev =>
          prev.map(b => (b.id === selectedBrand.id ? { ...b, status: updated.status } : b))
        );
        setSuccessMessage(`Đã cập nhật trạng thái thương hiệu "${selectedBrand.name}".`);
        setIsSuccessOpen(true);
      } else {
        setErrorMessage(updated.error || "Không thể cập nhật trạng thái.");
        setIsErrorOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      setErrorMessage("Cập nhật trạng thái thất bại.");
      setIsErrorOpen(true);
    } finally {
      setIsConfirmOpen(false);
      setSelectedBrand(null);
    }
  };

  const filteredBrands = brands.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));

    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "active" && b.status) ||
      (statusFilter === "inactive" && !b.status);

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredBrands.length / limit);
  const paginatedBrands = filteredBrands.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const renderBrandRow = (b, index) => (
    <tr key={b.id}>
      <td>{(page - 1) * limit + index + 1}</td>
      <td className="text-center">{b.name}</td>
      <td className="text-left !line-clamp-2">{b.description || "-"}</td>
      <td>
        <img src={b.logo_url} alt={b.name}  style={{width:"100%",objectFit: "cover", borderRadius: "6px" }} />
      </td>
      <td>
        <button
          className={`btn btn-sm px-3 py-1 rounded-full text-xs font-semibold ${b.status ? "btn-success" : "btn-outline-danger"}`}
          onClick={() => openConfirmModal(b)}
        >
          {b.status ? "Hiển thị" : "Ẩn"}
        </button>
      </td>
      <td>
        <Link href={`/admin/thuong-hieu/sua-thuong-hieu/${b.slug || b.id}`} className="btn btn-sm btn-outline-warning me-2">Sửa</Link>
        <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(b)}>Xoá</button>
      </td>
    </tr>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6 max-w-7xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="pm-title">Quản lý thương hiệu</h4>
        <Link href="/admin/thuong-hieu/them-thuong-hieu" className="bg-blue-900 text-white px-3 py-2 rounded">
          Thêm thương hiệu
        </Link>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên hoặc mô tả thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hiển thị</option>
            <option value="inactive">Ẩn</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p className="text-muted">Đang tải thương hiệu...</p>
        ) : (
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th className="!w-[20%]">Tên thương hiệu</th>
                <th className="!w-[40%]">Mô tả</th>
                <th className="!w-[15%]">Logo</th>
                <th>Trạng thái</th>
                <th className="!min-w-max">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBrands.length > 0 ? paginatedBrands.map(renderBrandRow) : (
                <tr><td colSpan="6" className="text-muted">Không tìm thấy thương hiệu phù hợp.</td></tr>
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

       <FormDelete isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} message={`Bạn có chắc chắn muốn xoá thương hiệu "${deleteBrand?.name}"?`} />
      <ModalConfirmStatus isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmStatus} message={`Bạn có chắc chắn muốn ${selectedBrand?.status ? "ẩn" : "hiển thị"} thương hiệu "${selectedBrand?.name}"?`} />
      <ModalSuccess isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMessage} />
      <ModalError isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} message={errorMessage} />
    </div>
  );
};

export default BrandList;
