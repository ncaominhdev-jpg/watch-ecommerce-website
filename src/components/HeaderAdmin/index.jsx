"use client";
import { FaCrown, FaUserShield } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/account/profile", {
          credentials: "include",
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/account/logout", { method: "POST" });
      setUser(null);
      setDropdownOpen(false);
      router.push("/dang-nhap");
    } catch (err) {
      console.error("Lỗi khi logout:", err);
    }
  };

  return (
    <header className="w-[82%] fixed top-0 right-0  z-50 bg-white shadow-md ">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <Link
              href="/admin"
              className="text-xl font-bold text-gray-700 hover:text-blue-600"
            >
              Trang quản trị
            </Link>
          )}
        </div>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md transition"
              onClick={toggleDropdown}
            >
              <div className="w-9 h-9 rounded-full border flex items-center justify-center bg-gray-100 text-gray-700">
                {user?.role === "super_admin" && <FaCrown className="text-yellow-500" size={20} />}
                {user?.role === "admin" && <FaUserShield className="text-blue-500" size={20} />}
                {!user?.role && <FaUser size={20} />}
              </div>
              <span className="text-gray-800 font-medium text-sm">
                {user?.name || "Tài khoản"}
              </span>
              <svg
                className={`w-4 h-4 transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <div
              className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 ${isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            >
              <div className="py-2 px-4 border-b">
                <p className="text-sm text-gray-500">Xin chào,</p>
                <p className="text-base font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-xs flex items-center gap-1 mt-1">
                  {user.role === "super_admin" && (
                    <span className="text-yellow-600 italic font-semibold">Quản trị viên</span>
                  )}
                  {user.role === "admin" && (
                    <span className="text-blue-600 italic">Nhân viên</span>
                  )}
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => router.push("/doi-mat-khau")}
                  className="w-full text-left text-sm text-blue-600 hover:bg-blue-50 px-4 py-2 rounded"
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded"
                >
                  <i className="fa fa-sign-out-alt mr-2"></i>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
