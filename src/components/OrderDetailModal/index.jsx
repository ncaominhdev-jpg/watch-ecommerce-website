'use client';

import React, { useEffect, useState } from 'react';
import { FaTimes, FaTrashAlt, FaBoxOpen } from 'react-icons/fa';
import { MdShoppingCart } from 'react-icons/md';
import Swal from 'sweetalert2';
import ReviewModal from '../ReviewModal/ReviewModal';

const OrderDetailModal = ({ isOpen, onClose, order, onOrderCanceled }) => {
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [reviewingProductId, setReviewingProductId] = useState(null);
    const [orderLocal, setOrderLocal] = useState(order);
    const [reviewingItem, setReviewingItem] = useState(null); // { productId, orderId }

    // Cập nhật local khi order props thay đổi
    useEffect(() => {
        setOrderLocal(order);
    }, [order]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleReview = (productId, orderId) => {
        setReviewingItem({ productId, orderId });
    };

    const closeReviewModal = () => {
        setReviewingProductId(null);
    };

    const handleReviewSubmit = () => {
        if (!reviewingProductId) return;

        const updatedItems = orderLocal.items.map(item => {
            if (item.productId === reviewingProductId) {
                return { ...item, reviewed: true };
            }
            return item;
        });

        const updatedOrder = { ...orderLocal, items: updatedItems };
        setOrderLocal(updatedOrder);

        closeReviewModal();
    };

    const handleCancelOrder = async () => {
        if (!order?.id) return;

        const result = await Swal.fire({
            title: 'Huỷ đơn hàng?',
            text: 'Bạn có chắc chắn muốn huỷ đơn hàng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Huỷ',
        });

        if (!result.isConfirmed) return;

        try {
            setLoadingCancel(true);
            const res = await fetch(`/api/account/orders/${order.id}/cancel`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Huỷ đơn thất bại');

            await Swal.fire({
                icon: 'success',
                title: 'Đã huỷ thành công',
                timer: 2000,
                showConfirmButton: false,
            });

            onClose();
            onOrderCanceled?.(); // callback để reload lại danh sách
        } catch (err) {
            console.error(err);
            Swal.fire('Lỗi', '❌ Không thể huỷ đơn hàng', 'error');
        } finally {
            setLoadingCancel(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Chờ xác nhận', color: 'orange' };
            case 'shipped': return { label: 'Đang vận chuyển', color: 'blue' };
            case 'delivered': return { label: 'Đã giao hàng', color: 'green' };
            case 'canceled': return { label: 'Đã huỷ', color: 'red' };
            default: return { label: status, color: 'gray' };
        }
    };

    if (!isOpen || !orderLocal) return null;

    return (
        <div className="order-detail-modal-overlay">
            <div className="order-detail-modal-box">
                <button className="order-detail-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2 className="order-detail-modal-title">
                    <span className="order-title-flex">
                        <MdShoppingCart />
                        <span>Đơn hàng #{orderLocal.id}</span>
                    </span>
                </h2>

                <div className="order-detail-section">
                    <h4>Thông tin đặt hàng</h4>
                    <ul>
                        <li><strong>Khách hàng:</strong> {orderLocal.name}</li>
                        <li><strong>Ngày đặt:</strong> {new Date(orderLocal.createdAt).toLocaleString('vi-VN')}</li>
                        <li>
                            <strong>Trạng thái:</strong>{' '}
                            <span style={{ color: getStatusInfo(orderLocal.status).color, fontWeight: 600 }}>
                                {getStatusInfo(orderLocal.status).label}
                            </span>
                        </li>
                        <li><strong>Tổng tiền:</strong> {orderLocal.total_price.toLocaleString('vi-VN')}₫</li>
                        <li><strong>Địa chỉ:</strong> {orderLocal.address}</li>
                        <li><strong>Ghi chú:</strong> {orderLocal.note || 'Không có'}</li>
                    </ul>
                </div>

                <div className="order-detail-section">
                    <h4 className="order-detail-product-heading">
                        <span className="order-title-flex">
                            <FaBoxOpen />
                            <span>Sản phẩm đã đặt</span>
                        </span>
                    </h4>

                    <ul className="order-detail-product-list">
                        {orderLocal.items.map((item) => (
                            <li key={item.id} className="order-detail-product-item">
                                <img src={item.image} alt={item.productName} />

                                <div className="item-content">
                                    <div className="info">
                                        <p className="name">{item.productName}</p>
                                        <p className="desc">Màu: {item.variantName} | SL: {item.quantity}</p>
                                        <p className="price">Giá: {item.price.toLocaleString('vi-VN')}₫</p>
                                    </div>

                                    {orderLocal.status === 'delivered' && (
                                        <div className="review-action">
                                            {item.reviewed ? (
                                                <span className="text-green-600 font-medium">Đã đánh giá</span>
                                            ) : (
                                                <button
                                                    className="btn-review"
                                                    onClick={() => handleReview(item.productId, order.id)} // <-- truyền orderId vào
                                                >
                                                    Đánh giá
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {orderLocal.status === 'pending' && (
                    <button
                        className="order-detail-modal-cancel-btn"
                        onClick={handleCancelOrder}
                        disabled={loadingCancel}
                    >
                        <span className="order-title-flex">
                            <FaTrashAlt />
                            <span>{loadingCancel ? 'Đang huỷ...' : 'Huỷ đơn hàng'}</span>
                        </span>
                    </button>
                )}
            </div>

            <ReviewModal
                isOpen={!!reviewingItem}
                onClose={() => setReviewingItem(null)}
                productId={reviewingItem?.productId}
                orderId={reviewingItem?.orderId} // <-- truyền xuống
                onSubmit={handleReviewSubmit}
            />

        </div>
    );
};

export default OrderDetailModal;
