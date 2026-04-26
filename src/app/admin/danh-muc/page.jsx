'use client';
import { useState, useEffect } from "react";
import Link from 'next/link';
import FormDelete from "../../../components/formDelete";
import ModalSuccess from "../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../components/ModalError/ModalError";
import ModalConfirmStatus from "../../../components/ModalConfirmStatus/ModalConfirmStatus";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteCategory, setDeleteCategory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error("Lỗi khi tải danh mục");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Không thể tải danh mục.");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (category) => {
    setDeleteCategory(category);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategory) return;

    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteCategory.id }),
      });

      const result = await res.json();

      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== deleteCategory.id));
        setSuccessMessage(`Đã xoá danh mục "${deleteCategory.name}" thành công.`);
        setIsSuccessOpen(true);
      } else {
        setErrorMessage(result.error || "Không thể xoá danh mục.");
        setIsErrorOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      setErrorMessage("Xoá danh mục thất bại.");
      setIsErrorOpen(true);
    } finally {
      setIsDeleteOpen(false);
      setDeleteCategory(null);
    }
  };

  const openConfirmModal = (cat) => {
    setSelectedCategory(cat);
    setIsConfirmOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedCategory) return;

    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCategory.id,
          name: selectedCategory.name,
          image: selectedCategory.image,
          status: !selectedCategory.status,
        }),
      });

      const updated = await res.json();

      if (res.ok) {
        setCategories(prev =>
          prev.map(c => (c.id === selectedCategory.id ? { ...c, status: updated.status } : c))
        );
        setSuccessMessage(`Đã cập nhật trạng thái danh mục "${selectedCategory.name}".`);
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
      setSelectedCategory(null);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "active" && cat.status) ||
      (statusFilter === "inactive" && !cat.status);

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / limit);
  const paginatedCategories = filteredCategories.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const renderCategoryRow = (cat, index) => (
    <tr key={cat.id}>
      <td>{(page - 1) * limit + index + 1}</td>
      <td className="text-start">{cat.name}</td>
      <td>
        <img
          src={cat.image}
          alt={cat.name}
          width="50"
          height="50"
          style={{ objectFit: "cover", borderRadius: "6px" }}
        />
      </td>
      <td>
        <button
          className={`btn btn-sm px-3 py-1 rounded-full text-xs font-semibold ${cat.status ? "btn-success" : "btn-outline-danger"}`}
          onClick={() => openConfirmModal(cat)}
        >
          {cat.status ? "Hiển thị" : "Ẩn"}
        </button>
      </td>
      <td>
        <Link href={`/admin/danh-muc/sua-danh-muc/${cat.slug || cat.id}`} className="btn btn-sm btn-outline-warning me-2">Sửa</Link>
        <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(cat)}>Xoá</button>
      </td>
    </tr>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6 max-w-7xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="pm-title">Quản lý danh mục</h4>
        <Link href="/admin/danh-muc/them-danh-muc" className="bg-blue-900 text-white px-3 py-2 rounded">Thêm danh mục</Link>
      </div>

       <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hiển thị</option>
            <option value="inactive">Ẩn</option>
          </select>
        </div>
      </div>

       <div className="table-responsive">
        {loading ? (
          <p className="text-muted !text-center">Đang tải danh mục...</p>
        ) : (
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên danh mục</th>
                <th>Ảnh</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map(renderCategoryRow)
              ) : (
                <tr><td colSpan="5" className="text-muted">Không tìm thấy danh mục phù hợp.</td></tr>
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

       <FormDelete isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} message={`Bạn có chắc chắn muốn xoá danh mục "${deleteCategory?.name}"?`} />
      <ModalConfirmStatus isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmStatus} message={`Bạn có chắc chắn muốn ${selectedCategory?.status ? "ẩn" : "hiển thị"} danh mục "${selectedCategory?.name}"?`} />
      <ModalSuccess isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMessage} />
      <ModalError isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} message={errorMessage} />
    </div>
  );
};

export default CategoryList;
