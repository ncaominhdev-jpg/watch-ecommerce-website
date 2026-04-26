'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/reviews/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
        setReview(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (id) fetchReview();
  }, [id]);

  if (error) return <p className="text-red-600 p-6">Lỗi: {error}</p>;
  if (!review) return <p className="p-6 text-gray-500">Đang tải đánh giá...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chi tiết đánh giá #{review.id}</h1>

      <div className="bg-white rounded border p-5 shadow text-sm space-y-3">
        <p><strong>Khách hàng:</strong> {review.user?.name}</p>
        <p><strong>Sản phẩm:</strong> {review.product?.name}</p>
        <p><strong>Số sao:</strong> {review.rating} ⭐</p>
        <p><strong>Ngày đánh giá:</strong> {new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
        <p><strong>Nội dung:</strong></p>
        <div className="bg-gray-100 p-3 rounded text-justify">
          {review.comment || <i>(Không có nhận xét)</i>}
        </div>

        {review.review_images?.length > 0 && (
          <div className="mt-4 space-y-1">
            <strong>Hình ảnh đính kèm:</strong>
            <div className="flex gap-2 flex-wrap">
              {review.review_images.map((img, i) => (
                <img key={i} src={img.image_url} alt={`img-${i}`} className="w-24 h-24 object-cover rounded border" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/admin/danh-gia"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}
