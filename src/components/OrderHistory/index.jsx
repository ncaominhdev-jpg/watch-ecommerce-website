'use client';

import React, { useEffect, useState } from 'react';
import OrderDetailModal from '../OrderDetailModal';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingModal, setIsLoadingModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 3;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Chờ xác nhận', color: '#f59e0b' };
            case 'shipped': return { label: 'Đang vận chuyển', color: '#3b82f6' };
            case 'delivered': return { label: 'Đã giao hàng', color: '#10b981' };
            case 'canceled': return { label: 'Đã huỷ', color: '#ef4444' };
            default: return { label: status, color: '#6b7280' };
        }
    };

    const statusLabels = {
        all: 'Tất cả',
        pending: 'Chờ xác nhận',
        shipped: 'Đang vận chuyển',
        delivered: 'Đã giao hàng',
        canceled: 'Đã huỷ',
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'shipped': return '#3b82f6';
            case 'delivered': return '#10b981';
            case 'canceled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const statusOptions = Object.keys(statusLabels);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/account/profile', { credentials: 'include' });
            const data = await res.json();
            setOrders(data.user?.orders || []);
        } catch (err) {
            console.error('Lỗi lấy đơn hàng:', err);
            toast.error('❌ Không lấy được danh sách đơn hàng');
        }
    };

    const handleViewDetail = async (orderId) => {
        setIsLoadingModal(true);
        setIsModalOpen(true);
        try {
            const res = await fetch(`/api/account/orders/${orderId}/detail`, {
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Không lấy được chi tiết đơn hàng');
            const data = await res.json();
            setSelectedOrder(data.order);
        } catch (err) {
            setSelectedOrder(null);
            console.error('Lỗi khi tải đơn hàng:', err);
            toast.error('❌ Không lấy được chi tiết đơn hàng');
        } finally {
            setIsLoadingModal(false);
        }
    };

    const handleCancel = async (orderId) => {
        const result = await Swal.fire({
            title: 'Huỷ đơn hàng?',
            text: 'Bạn có chắc muốn huỷ đơn này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, huỷ ngay',
            cancelButtonText: 'Không',
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/account/orders/${orderId}/cancel`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Không thể huỷ đơn hàng');
            const result = await res.json();

            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId ? { ...order, status: 'canceled' } : order
                )
            );
            toast.success('🗑 Đơn hàng đã được huỷ thành công.');
        } catch (err) {
            console.error('Lỗi huỷ đơn:', err);
            toast.error('❌ Huỷ đơn thất bại');
        }
    };

    const filteredOrders =
        statusFilter === 'all'
            ? orders
            : orders.filter((order) => order.status === statusFilter);

    const totalPages = Math.ceil(filteredOrders.length / perPage);
    const paginate = (items) =>
        items.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="order-history">
            {/* Tabs filter */}
            <div className="order-tabs">
                {statusOptions.map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setStatusFilter(status);
                            setCurrentPage(1);
                        }}
                        className={`order-tab ${statusFilter === status ? 'active' : ''}`}
                        style={{
                            color: statusFilter === status ? '#fff' : getStatusColor(status),
                            backgroundColor: statusFilter === status ? getStatusColor(status) : 'transparent',
                            border: `1px solid ${getStatusColor(status)}`,
                            fontWeight: 600,
                            borderRadius: '4px',
                            padding: '6px 12px',
                            marginRight: 8,
                            cursor: 'pointer',
                        }}
                    >
                        {statusLabels[status]}
                    </button>
                ))}
            </div>

            {/* Orders */}
            <div className="order-list">
                {filteredOrders.length > 0 ? (
                    <>
                        {paginate(filteredOrders).map((order) => {
                            const { label, color } = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="order-item">
                                    <div className="order-info">
                                        <p>
                                            Mã đơn: <span className="order-id">#{order.id}</span>
                                        </p>
                                        <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="order-status">
                                        <p className="order-total">
                                            {order.total_price.toLocaleString('vi-VN')}₫
                                        </p>
                                        <p
                                            className="order-status-text"
                                            style={{ fontWeight: 600, color }}
                                        >
                                            {label}
                                        </p>
                                        <div className="order-buttons">
                                            <button
                                                className="order-detail-btn"
                                                onClick={() => handleViewDetail(order.id)}
                                            >
                                                Xem chi tiết
                                            </button>
                                            {order.status === 'pending' && (
                                                <button
                                                    className="order-cancel-btn"
                                                    onClick={() => handleCancel(order.id)}
                                                >
                                                    Huỷ đơn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
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
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="order-empty">
                        <p>Không có đơn hàng nào</p>
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                isLoading={isLoadingModal}
                onOrderCanceled={fetchOrders} // ✅ truyền hàm cập nhật
            />

            {/* Toast container */}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default OrderHistory;
