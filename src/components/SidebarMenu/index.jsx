'use client';
import React, { useRef, useState, useEffect } from 'react';
import {
    FaUser,
    FaLock,
    FaSignOutAlt,
    FaHistory,
    FaMapMarkedAlt,
} from 'react-icons/fa';
import constants from '../../constants/constants';
import defaultAvatar from '../../../public/image/users/73891f264b13033cc665cd731757848d.jpg';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const SidebarMenu = ({ tab, setTab, user }) => {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(user?.image || defaultAvatar.src);

    useEffect(() => {
        if (user?.image) {
            setPreview(user.image);
        } else {
            setPreview(defaultAvatar.src);
        }
    }, [user?.image]);


    // Upload ảnh lên Cloudinary
    const uploadAvatarToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', constants.UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const result = await res.json();
        if (!res.ok || !result.secure_url) {
            throw new Error('Upload ảnh thất bại');
        }
        return result.secure_url;
    };

    // Gửi URL ảnh mới lên backend
    const updateUserAvatar = async (imageUrl) => {
        const res = await fetch('/api/account/change-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageUrl }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Cập nhật ảnh thất bại');
        return result.user;
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const imageUrl = await uploadAvatarToCloudinary(file);
                await updateUserAvatar(imageUrl);
                setPreview(imageUrl);

                toast.success('Cập nhật ảnh đại diện thành công!');
            } catch (err) {
                 toast.error('❌ ' + err.message);
            }
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/account/logout', { method: 'POST' });

            if (!res.ok) throw new Error('Đăng xuất thất bại');

            Cookies.remove('jwt-datt');

            localStorage.removeItem('checkoutItems');

            toast.success('Đăng xuất thành công');

            router.push('/');

            router.refresh();
        } catch (err) {
            console.error('Lỗi khi logout:', err);
            toast.error('Đăng xuất thất bại');
        }
    };
    const tabClass = (active) =>
        `sidebar-tab ${active ? 'active' : ''}`;

    return (
        <aside className="sidebar-container">
            <div className="sidebar-header">
                <label htmlFor="avatar-upload" className="cursor-pointer relative group">
                    <img
                        src={preview}
                        alt="Avatar"
                        className="sidebar-avatar group-hover:opacity-80 transition"
                    />
                    <input
                        type="file"
                        id="avatar-upload"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition">
                        Đổi ảnh
                    </span>
                </label>

                <div className="sidebar-user-info !p-2">
                    <h3 className="sidebar-user-name">{user?.name}</h3>
                    <p className="sidebar-user-phone">
                        {user?.phone
                            ? user.phone.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, a, b, c) =>
                                `${a}${b ? '•'.repeat(b.length) : ''}${c ? c.slice(-2) : ''}`
                            )
                            : '••••••••'}
                    </p>
                </div>
            </div>

            <ul className="sidebar-menu !p-2">
                <li>
                    <button
                        onClick={() => setTab('info')}
                        className={tabClass(tab === 'info')}
                    >
                        <FaUser /> Thông tin cá nhân
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setTab('history')}
                        className={tabClass(tab === 'history')}
                    >
                        <FaHistory /> Lịch sử mua hàng
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setTab('address')}
                        className={tabClass(tab === 'address')}
                    >
                        <FaMapMarkedAlt /> Sổ địa chỉ
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setTab('password')}
                        className={tabClass(tab === 'password')}
                    >
                        <FaLock /> Đổi mật khẩu
                    </button>
                </li>
                <li>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default SidebarMenu;
