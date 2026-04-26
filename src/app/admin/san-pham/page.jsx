'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import FormDelete from "../../../components/formDelete";
import ModalSuccess from "../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../components/ModalError/ModalError";
import ModalConfirmStatus from "../../../components/ModalConfirmStatus/ModalConfirmStatus";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // 🆕 Filter status

  const [loading, setLoading] = useState(true);

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data);
      else console.error("Không thể lấy sản phẩm:", data.error);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setErrorMessage("Không thể tải danh sách sản phẩm.");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (err) {
      console.error("Lỗi khi lấy categories:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (res.ok) setBrands(data);
    } catch (err) {
      console.error("Lỗi khi lấy brands:", err);
    }
  };

  const openDeleteModal = (product) => {
    setDeleteProduct(product);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;

    try {
      const res = await fetch(`/api/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteProduct.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deleteProduct.id));
        setSuccessMessage(`Đã xoá sản phẩm "${deleteProduct.name}" thành công.`);
        setIsSuccessOpen(true);
      } else {
        setErrorMessage(data.error || "Xoá sản phẩm thất bại.");
        setIsErrorOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi xoá sản phẩm:", err);
      setErrorMessage("Xoá sản phẩm thất bại.");
      setIsErrorOpen(true);
    } finally {
      setIsDeleteOpen(false);
      setDeleteProduct(null);
    }
  };

  const openConfirmModal = (product) => {
    setSelectedProduct(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedProduct) return;

    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProduct.id,
          status: !selectedProduct.status,
        }),
      });

      const updated = await res.json();

      if (res.ok) {
        setProducts(prev =>
          prev.map(p => (p.id === selectedProduct.id ? { ...p, status: updated.status } : p))
        );
        setSuccessMessage(`Đã cập nhật trạng thái sản phẩm "${selectedProduct.name}".`);
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
      setSelectedProduct(null);
    }
  };

  // 🔎 Filter + phân trang
  const filteredProducts = products.filter((p) => {
    const brandName = p.brand?.name || "";
    const categoryId = p.category?.id || "";
    const brandId = p.brand?.id || "";
    const price = p.price || 0;

    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      brandName.toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter === "" || categoryId == categoryFilter;
    const matchBrand = brandFilter === "" || brandId == brandFilter;
    const matchPriceMin = priceMin === "" || price >= parseInt(priceMin);
    const matchPriceMax = priceMax === "" || price <= parseInt(priceMax);

    const matchStatusFilter =
      statusFilter === "" ||
      (statusFilter === "active" && p.status) ||
      (statusFilter === "inactive" && !p.status);

    return matchSearch && matchCategory && matchBrand && matchPriceMin && matchPriceMax && matchStatusFilter;
  });

  const totalPages = Math.ceil(filteredProducts.length / limit);
  const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, brandFilter, priceMin, priceMax, statusFilter]);

  const renderRow = (p, i) => {
    const stock = p.product_variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;
    const formattedPrice = typeof p.price === "number"
      ? p.price.toLocaleString("vi-VN") + "₫"
      : "0₫";

    return (
      <tr key={p.id}>
        <td>{(page - 1) * limit + i + 1}</td>
        <td className="text-start">
          {p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name}
        </td>
        <td>{p.category?.name || "Không rõ"}</td>
        <td>{p.brand?.name || "Không rõ"}</td>
        <td>{formattedPrice}</td>
        <td>{stock}</td>
        <td>
          <button
            className={`btn btn-sm px-3 py-1 rounded-full text-xs font-semibold ${p.status ? "btn-success" : "btn-outline-danger"}`}
            onClick={() => openConfirmModal(p)}
          >
            {p.status ? "Hiển thị" : "Ẩn"}
          </button>
        </td>
        <td>
          <Link href={`/admin/san-pham/${p.slug}`} className="btn btn-sm btn-outline-primary me-2">Chi tiết</Link>
          <Link href={`/admin/san-pham/sua-san-pham/${p.slug}`} className="btn btn-sm btn-outline-warning me-2">Sửa</Link>
          <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(p)}>Xoá</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6 max-w-7xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="pm-title">Quản lý sản phẩm</h4>
        <Link href="/admin/san-pham/them-san-pham" className="bg-blue-900 text-white px-3 py-2 rounded">Thêm sản phẩm</Link>
      </div>

       <div className="row mb-3">
        <div className="col-md-3">
          <input type="text" className="form-control" placeholder="Tìm theo tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
            <option value="">Thương hiệu</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="col-md-3 d-flex">
          <input type="number" className="form-control me-2" placeholder="Giá từ" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          <input type="number" className="form-control" placeholder="Giá đến" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="" className="bg-primary text-amber-50">Tất cả trạng thái</option>
            <option value="active" className="bg-success text-amber-50">Hiển thị</option>
            <option value="inactive" className="bg-danger text-amber-50">Ẩn</option>
          </select>
        </div>
      </div>

      {/* 📝 Table */}
      <div className="table-responsive">
        {loading ? (
          <p className="text-muted">Đang tải sản phẩm...</p>
        ) : (
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? paginatedProducts.map(renderRow) : (
                <tr><td colSpan="8" className="text-muted">Không tìm thấy sản phẩm phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 🆕 Phân trang */}
      <div className="d-flex justify-content-center align-items-center my-3">
        <button className="btn btn-outline-primary me-2" disabled={page === 1} onClick={() => setPage(page - 1)}>Trang trước</button>
        <span>Trang {page} / {totalPages}</span>
        <button className="btn btn-outline-primary ms-2" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Trang sau</button>
      </div>

      {/* Modals */}
      <FormDelete isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} message={`Bạn có chắc chắn muốn xoá sản phẩm "${deleteProduct?.name}"?`} />
      <ModalSuccess isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMessage} />
      <ModalError isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} message={errorMessage} />
      <ModalConfirmStatus isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmStatus} message={`Bạn có chắc chắn muốn ${selectedProduct?.status ? "ẩn" : "hiển thị"} sản phẩm "${selectedProduct?.name}"?`} />
    </div>
  );
};

export default ProductManagement;
