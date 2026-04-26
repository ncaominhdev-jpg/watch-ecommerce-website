'use client';

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import AddressModal from './AddressModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [latestAddress, setLatestAddress] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const perPage = 3;

    const totalPages = Math.ceil(addresses.length / perPage);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/account/profile', { credentials: 'include' });
            const data = await res.json();
            const fetched = data.user?.addresses || [];

            setAddresses(fetched);

            const latest = fetched.reduce((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt);
                const dateB = new Date(b.updatedAt || b.createdAt);
                return dateA > dateB ? a : b;
            }, fetched[0]);

            setLatestAddress(latest);
        } catch (err) {
            console.error('Lỗi tải địa chỉ:', err);
            toast.error('❌ Lỗi tải địa chỉ');
        }
    };

    const handleSubmitAddress = async (data) => {
        const isEdit = !!selectedAddress;
        const url = isEdit ? `/api/account/addresses/${selectedAddress.id}` : '/api/account/addresses';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Lỗi xử lý địa chỉ');

            await fetchAddresses();
            setShowModal(false);
            setSelectedAddress(null);
            toast.success(isEdit ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
        } catch (err) {
            console.error('Lỗi xử lý địa chỉ:', err);
            toast.error('' + err.message);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Xoá địa chỉ?',
            text: 'Bạn có chắc chắn muốn xoá địa chỉ này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Huỷ',
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`/api/account/addresses/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Không thể xoá địa chỉ');

            await fetchAddresses();
            toast.success('Xoá địa chỉ thành công');
        } catch (err) {
            console.error('Lỗi xoá địa chỉ:', err);
            toast.error('Xoá thất bại: ' + err.message);
        }
    };

    const paginate = (items) =>
        items.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <>
            <div className="address-list-wrapper">
                <div className="address-header">
                    <h3 className="address-title">Sổ địa chỉ</h3>
                    <button
                        className="add-address-btn"
                        onClick={() => {
                            setSelectedAddress(null);
                            setShowModal(true);
                        }}
                    >
                        + Thêm địa chỉ
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <div className="address-empty">
                        <p>Bạn chưa có địa chỉ nào được tạo</p>
                    </div>
                ) : (
                    <>
                        <ul className="address-list">
                            {paginate(addresses).map((addr) => (
                                <li key={addr.id} className="address-item">
                                    <div>
                                        <p className="address-name">{addr.recipient_name} - {addr.phone}</p>
                                        <p className="address-text">{addr.address}</p>
                                    </div>
                                    <div className="address-actions">
                                        <button
                                            onClick={() => {
                                                setSelectedAddress(addr);
                                                setShowModal(true);
                                            }}
                                            className="edit-btn"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="delete-btn"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                >
                                    ←
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={currentPage === i + 1 ? 'active' : ''}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AddressModal
                visible={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedAddress(null);
                }}
                onSubmit={handleSubmitAddress}
                address={selectedAddress}
            />

            {/* Toast hiển thị thông báo */}
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default AddressList;
