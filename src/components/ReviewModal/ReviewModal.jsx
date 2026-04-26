'use client';

import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaStar, FaRegStar } from 'react-icons/fa';
import constants from '../../constants/constants';
import { toast, ToastContainer } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, productId, orderId, onSubmit }) => {

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]); // preview URLs
    const [imageFiles, setImageFiles] = useState([]); // real files
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);

        const preview = files.map(file => URL.createObjectURL(file));
        setImages(preview);
    };

    const handleSubmit = async () => {
        if (!rating || !productId) return;
        setSubmitting(true);
        try {
            // Upload ảnh
            const uploadedUrls = await Promise.all(
                imageFiles.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', constants.UPLOAD_PRESET);

                    const res = await fetch(`https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`, {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await res.json();
                    return data.secure_url;
                })
            );

            // Gửi đánh giá
            const res = await fetch('/api/account/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: productId,
                    order_id: orderId, // thêm dòng này
                    rating,
                    comment,
                    images: uploadedUrls,
                }),

            });

            if (!res.ok) throw new Error('Gửi đánh giá thất bại');

            toast.success('Đánh giá thành công!');
            onSubmit?.();

            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            console.error(err);
            toast.error('❌ Gửi đánh giá thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-box">
                <button className="review-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>
                <h2 className="review-modal-title">Đánh giá sản phẩm</h2>

                <div className="review-modal-field">
                    <label className="review-modal-label">Số sao:</label>
                    <div className="review-modal-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                className="star-icon"
                            >
                                {star <= rating ? <FaStar className="filled" /> : <FaRegStar />}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="review-modal-field">
                    <label className="review-modal-label">Nội dung đánh giá:</label>
                    <textarea
                        className="review-modal-textarea"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="review-modal-field">
                    <label className="review-modal-label">Ảnh đánh giá:</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="review-modal-file"
                    />
                    <div className="review-modal-preview">
                        {images.map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt={`preview-${idx}`}
                                className="review-modal-preview-img"
                            />
                        ))}
                    </div>
                </div>

                <button
                    className="review-modal-submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </div>
            <ToastContainer position="top-center" autoClose={2000} />
        </div>
    );
};

export default ReviewModal;
