'use client';

import { useState, useEffect } from "react";
import { FaUserShield, FaUser } from "react-icons/fa";
import Link from 'next/link';
import FormDelete from "../../../components/formDelete";
import ModalSuccess from "../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../components/ModalError/ModalError";
import ModalConfirmStatus from "../../../components/ModalConfirmStatus/ModalConfirmStatus";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCurrentUser();
    loadUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/account/profile', { credentials: 'include' });
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (err) {
      console.error("Lỗi lấy người dùng hiện tại:", err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi khi fetch user:", error);
      setErrorMessage("Không thể tải danh sách người dùng.");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Nhân viên";
    if (role === "super_admin") return "Quản Trị Viên";
    return "Khách hàng";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <FaUserShield className="text-danger me-1" />;
    if (role === "super_admin") return <FaUserShield className="text-secondary me-1" />;
    return <FaUser className="text-success me-1" />;
  };

  const openDeleteModal = (user) => {
    setDeleteUser(user);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteUser.id }),
      });

      const result = await res.json();

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
        setSuccessMessage(`Đã xoá người dùng "${deleteUser.name}" thành công.`);
        setIsSuccessOpen(true);
      } else {
        setErrorMessage(result.error || "Không thể xoá người dùng.");
        setIsErrorOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi xoá người dùng:", error);
      setErrorMessage("Xoá người dùng thất bại.");
      setIsErrorOpen(true);
    } finally {
      setIsDeleteOpen(false);
      setDeleteUser(null);
    }
  };

  const openConfirmModal = (user) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          status: !selectedUser.status,
        }),
      });

      const updated = await res.json();

      if (res.ok) {
        setUsers(prev =>
          prev.map(u => (u.id === selectedUser.id ? { ...u, status: updated.status } : u))
        );
        setSuccessMessage(`Đã cập nhật trạng thái người dùng "${selectedUser.name}".`);
        setIsSuccessOpen(true);
      } else {
        setErrorMessage(updated.error || "Không thể cập nhật trạng thái.");
        setIsErrorOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      setErrorMessage("Cập nhật trạng thái thất bại.");
      setIsErrorOpen(true);
    } finally {
      setIsConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (currentUser?.role === "admin" && u.role !== "customers") return false;

    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);

    const matchTab =
      tab === "all" ||
      (tab === "super_admin" && u.role === "super_admin") ||
      (tab === "admin" && u.role === "admin") ||
      (tab === "customers" && u.role !== "admin" && u.role !== "super_admin");

    return matchSearch && matchTab;
  });

  const totalPages = Math.ceil(filteredUsers.length / limit);
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  const renderUserRow = (u, i) => (
    <tr key={u.id}>
      <td>{(page - 1) * limit + i + 1}</td>
      <td className="text-start">{u.name}</td>
      <td>{u.email}</td>
      <td>{u.phone}</td>
      <td>
        <div className="d-flex justify-content-center align-items-center gap-1">
          {getRoleIcon(u.role)}
          <span>{getRoleLabel(u.role)}</span>
        </div>
      </td>
      <td>
        {u.role !== "super_admin" ? (
          <button
            className={`btn btn-sm px-3 py-1 rounded-full text-xs font-semibold ${u.status ? "btn-success" : "btn-outline-danger"
              }`}
            onClick={() => openConfirmModal(u)}
          >
            {u.status ? "Hoạt động" : "Vô hiệu"}
          </button>
        ) : (
          <span className="badge bg-secondary">Luôn hoạt động</span>
        )}
      </td>

      <td>
        {/* Chỉ hiển thị nút Sửa nếu user được chọn KHÔNG phải super_admin */}
        {u.role !== "super_admin" && (
          <Link
            href={`/admin/tai-khoan/sua-tai-khoan/${u.id}`}
            className="btn btn-sm btn-outline-warning me-2"
          >
            Sửa
          </Link>
        )}

        {/* Nút Xoá: chỉ super_admin mới có quyền, và không cho xoá super_admin */}
        {currentUser?.role === "super_admin" && u.role !== "super_admin" && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => openDeleteModal(u)}
          >
            Xoá
          </button>
        )}
      </td>

    </tr>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6 max-w-7xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="pm-title">Quản lý người dùng</h4>
        {currentUser?.role === "super_admin" && (
          <Link
            href="/admin/tai-khoan/them-tai-khoan"
            className="bg-blue-900 text-white px-3 py-2 rounded"
          >
            Thêm tài khoản
          </Link>
        )}
      </div>

      {currentUser?.role !== "admin" && (
        <div className="d-flex gap-3 mb-3">
          <button className={`btn ${tab === "all" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setTab("all")}>Tất cả</button>
          <button className={`btn ${tab === "super_admin" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => setTab("super_admin")}>Quản Trị Viên</button>
          <button className={`btn ${tab === "admin" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setTab("admin")}>Nhân Viên</button>
          <button className={`btn ${tab === "customers" ? "btn-success" : "btn-outline-success"}`} onClick={() => setTab("customers")}>Khách hàng</button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        {loading ? (
          <p className="text-muted">Đang tải người dùng...</p>
        ) : (
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? paginatedUsers.map(renderUserRow) : (
                <tr><td colSpan="7" className="text-muted">Không tìm thấy người dùng phù hợp.</td></tr>
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

      <FormDelete isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} message={`Bạn có chắc chắn muốn xoá người dùng "${deleteUser?.name}"?`} />
      <ModalConfirmStatus isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmStatus} message={`Bạn có chắc chắn muốn ${selectedUser?.status ? "vô hiệu hoá" : "kích hoạt"} người dùng "${selectedUser?.name}"?`} />
      <ModalSuccess isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMessage} />
      <ModalError isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} message={errorMessage} />
    </div>
  );
};

export default UserList;
