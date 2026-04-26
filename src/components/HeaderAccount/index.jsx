// src/app/components/HeaderAccount.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const HeaderAccount = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/account/decodeJwtCookie')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);


  const handleLogout = async () => {
    try {
      
      await fetch('/api/account/logout', { method: 'POST' });

      Cookies.remove('jwt-datt');

      localStorage.removeItem('checkoutItems');

      setUser(null);
      setShowDropdown(false);

      router.push('/');

      router.refresh();
    } catch (err) {
      console.error('Lỗi khi logout:', err);
    }
  };

  return (
    // <div className="relative !z-10 pt-3 text-white">
    // Đây là phần tử bạn cần đặt onMouseEnter và onMouseLeave
    // Nó phải bao gồm CẢ div chứa "Tài khoản" và div của dropdown
    <div
      className="relative !z-10 pt-3 text-white" // Đảm bảo `relative` ở đây
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <div className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors">
        <span className="font-medium">{user ? user.name : 'Tài khoản'}</span>
        <FaUser size={20} className="mb-[2px]" />
      </div>

      {showDropdown && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pt-2">
          <div className="w-52 bg-white text-gray-800 rounded-lg shadow-lg z-20 overflow-hidden border border-gray-200">
            <div className="p-3 border-b border-gray-200 text-center">
              <p className="font-semibold">{user ? `Xin chào, ${user.name}` : 'Chào mừng bạn!'}</p>
            </div>

            <div className="flex flex-col text-md divide-y divide-gray-100">
              {user ? (
                <>
                  <Link href="/thong-tin-ca-nhan" className="!px-4 !py-2 hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span>Thông tin cá nhân</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="!px-4 !py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center justify-between"
                  >
                    <span>Đăng xuất</span>
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/dang-nhap" className="!px-4 !py-2 hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span>Đăng nhập</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link href="/dang-ky" className="!px-4 !py-2 hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <span>Đăng ký</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderAccount;