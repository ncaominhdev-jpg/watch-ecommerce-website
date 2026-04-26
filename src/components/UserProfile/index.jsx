'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/account/profile');
        if (res.status === 401) {
          // router.push('/dang-nhap');
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setPreview(`/uploads/${data.user.avatar}`);
      } catch (error) {
        console.error('Lỗi:', error);
        setUser(null);
        // router.push('/dang-nhap');
      }
    };

    fetchUser();
  }, [router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/account/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setPreview(`/uploads/${result.avatar}`);
        setUser((prev) => ({ ...prev, avatar: result.avatar }));
      } else {
        alert(result.message || 'Cập nhật ảnh thất bại');
      }
    } catch (err) {
      console.error('Upload lỗi:', err);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <p className="text-gray-600 text-lg">Chưa đăng nhập hoặc không lấy được dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9f2ff] px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-xl relative">

        <button
          onClick={() => window.history.back()}
          className="absolute top-5 left-6 text-blue-700 text-sm hover:underline"
        >
          ← Trở lại
        </button>

        <h2 className="text-3xl font-bold text-center text-[#043175] mb-6">Thông tin cá nhân</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || '/default-avatar.png'}
            alt="avatar"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 shadow-sm hover:scale-105 transition-transform"
          />
          <button
            onClick={handleImageClick}
            className="mt-2 text-sm text-[#043175] hover:text-blue-900"
          >
            Đổi ảnh
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

         <hr className="border-t-2 border-blue-200 mb-6" />

         <div className="space-y-5 text-gray-800 text-[17px] ml-10">
          <div>
            <span className="font-semibold text-[#043175]">Họ tên:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold text-[#043175]">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold text-[#043175]">Số điện thoại:</span> {user.phone}
          </div>
          <div>
            <span className="font-semibold text-[#043175]">Vai trò:</span>{' '}
            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </div>
        </div>
      </div>
    </div>
  );
}
