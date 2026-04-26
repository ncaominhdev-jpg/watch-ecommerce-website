"use client";

import {
  FaTachometerAlt, FaClock, FaTags, FaThList, FaUserCog,
  FaUsers, FaNewspaper, FaFileInvoice, FaStar, FaEnvelopeOpenText
} from "react-icons/fa";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

function Aside() {
  const location = usePathname();

  return (
    <aside className="left-sidebar">
      <div>
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link href="/admin" className="text-nowrap logo-img">
            <img src="/image/main/logonight.jpg" width="80" alt="Logo" />
          </Link>
          <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
            <i className="ti ti-x fs-8"></i>
          </div>
        </div>

        <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
          <ul id="sidebarnav">
            <li className="nav-small-cap">
              <span className="hide-menu">Home</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin">
                <FaTachometerAlt />
                <span className="hide-menu">Bảng điều khiển</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/san-pham" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/san-pham">
                <FaClock />
                <span className="hide-menu">Sản phẩm đồng hồ</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/danh-muc" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/danh-muc">
                <FaThList />
                <span className="hide-menu">Danh mục</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/thuong-hieu" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/thuong-hieu">
                <FaTags />
                <span className="hide-menu">Thương hiệu</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý tài khoản</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/tai-khoan" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/tai-khoan">
                <FaUsers />
                <span className="hide-menu">Người dùng</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý chung</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/tin-tuc" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/tin-tuc">
                <FaNewspaper />
                <span className="hide-menu">Tin tức</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/hoa-don" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/hoa-don">
                <FaFileInvoice />
                <span className="hide-menu">Hóa đơn</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/danh-gia" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/danh-gia">
                <FaStar />
                <span className="hide-menu">Đánh giá</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/lien-he" ? "active" : ""}`}>
              <Link className="sidebar-link" href="/admin/lien-he">
                <FaEnvelopeOpenText />
                <span className="hide-menu">Liên hệ</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Aside;
