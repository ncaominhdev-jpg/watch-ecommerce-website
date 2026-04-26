'use client';
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Slider from "react-slick";
import { useRouter, useParams } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import constants from "../../../../constants/constants";
import ImageUploadModal from "../../../../form/ImageUploadModal/ImageUploadModal";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import ProductVariantModal from "../../../../form/ProductVariantModal/ProductVariantModal";
import ModalConfirmStatus from "../../../../components/ModalConfirmStatus/ModalConfirmStatus";
import ModalSuccess from "../../../../components/ModalSuccess/ModalSuccess";
import ModalError from "../../../../components/ModalError/ModalError";

const ProductDetail = () => {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState(null);
  const [editVariant, setEditVariant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const openConfirmModal = (message, onConfirm) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.slug}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) fetchProduct();
  }, [params.slug]);

  const handleRemoveImage = async (imageId) => {
    openConfirmModal("Bạn có chắc muốn xoá ảnh này?", async () => {
      try {
        const res = await fetch(`/api/products/images/${imageId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Xoá thất bại");
        setProduct((prev) => ({
          ...prev,
          product_images: prev.product_images.filter((img) => img.id !== imageId),
        }));
        setSuccessModal({ isOpen: true, message: "Đã xoá ảnh thành công!" });
      } catch (err) {
        console.error("Lỗi xoá ảnh:", err);
        setErrorModal({ isOpen: true, message: "Không thể xoá ảnh." });
      }
    });
  };

  const handleUploadImages = async (files) => {
    try {
      const uploadedUrls = [];
      const createdImages = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", constants.UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${constants.CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        const result = await res.json();
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      }

      for (const url of uploadedUrls) {
        const res = await fetch(`/api/products/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id, image_url: url }),
        });
        const data = await res.json();
        if (res.ok) createdImages.push(data);
        else throw new Error("Lỗi khi lưu ảnh vào hệ thống");
      }

      setProduct((prev) => ({
        ...prev,
        product_images: [...prev.product_images, ...createdImages]
      }));

      setSuccessModal({ isOpen: true, message: "Đã thêm ảnh thành công!" });
    } catch (err) {
      console.error("Lỗi thêm ảnh:", err);
      setErrorModal({ isOpen: true, message: "Không thể thêm ảnh." });
    }
  };

  const toggleStatus = async (variant) => {
    try {
      const res = await fetch(`/api/products/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !variant.status }),
      });
      const updated = await res.json();
      if (res.ok) {
        setProduct((prev) => ({
          ...prev,
          product_variants: prev.product_variants.map(v =>
            v.id === variant.id ? { ...v, status: updated.status } : v
          ),
        }));
        setSuccessModal({ isOpen: true, message: `Biến thể đã ${updated.status ? 'hiển thị' : 'ẩn'} thành công!` });
      } else {
        setErrorModal({ isOpen: true, message: updated.error || 'Không thể cập nhật trạng thái.' });
      }
    } catch (err) {
      setErrorModal({ isOpen: true, message: 'Lỗi cập nhật trạng thái biến thể.' });
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const res = await fetch(`/api/products/variants/${variantId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setProduct((prev) => ({
          ...prev,
          product_variants: prev.product_variants.filter(v => v.id !== variantId)
        }));
        setSuccessModal({ isOpen: true, message: "Đã xoá biến thể thành công!" });
      } else {
        setErrorModal({ isOpen: true, message: data.error || "Không thể xoá biến thể." });
      }
    } catch (err) {
      setErrorModal({ isOpen: true, message: "Xoá biến thể thất bại." });
    }
  };

  const renderProductVariants = () => {
    if (!product?.product_variants?.length) return (
      <tr><td colSpan="9" className="text-muted">Chưa có biến thể nào</td></tr>
    );

    return product.product_variants.map((v, i) => (
      <tr key={v.id}>
        <td>{i + 1}</td>
        <td>{v.name_color}</td>
        <td>
          <span className="d-inline-block rounded-circle border" style={{ backgroundColor: v.code_color, width: 20, height: 20 }} />
        </td>
        <td>{v.price.toLocaleString('vi-VN')}₫</td>
        <td>{v.discount ? `-${v.discount.toLocaleString('vi-VN')}₫` : '0₫'}</td>
        <td className="text-danger fw-bold">{(v.price - (v.discount || 0)).toLocaleString('vi-VN')}₫</td>
        <td>{v.quantity}</td>
        <td>
          <button
            className={`btn btn-sm px-3 py-1 rounded-full text-xs font-semibold ${v.status ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => openConfirmModal(
              `Bạn có chắc muốn ${v.status ? 'ẩn' : 'hiển thị'} biến thể này?`,
              () => toggleStatus(v)
            )}
          >{v.status ? 'Hiển thị' : 'Ẩn'}</button>
        </td>
        <td>
          <button className="btn btn-sm btn-outline-info me-1" onClick={() => { setCurrentVariant(v); setShowAddQuantityModal(true); }}>Thêm số lượng</button>
          <button className="btn btn-sm btn-outline-warning me-1" onClick={() => { setEditVariant(v); setShowEditModal(true); }}>Chỉnh sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => openConfirmModal("Bạn có chắc muốn xoá biến thể này?", () => handleDeleteVariant(v.id))}>Xoá</button>
        </td>
      </tr>
    ));
  };

  if (loading) return <div className="text-center py-5">Đang tải sản phẩm...</div>;
  if (!product) return <div className="text-center text-danger py-5">Không tìm thấy sản phẩm</div>;

  return (
    <div>
      <div className="bg-white border rounded-xl shadow-md p-4 mb-3">
        <div className="row g-4 align-items-start">
          <div className="col-md-7 p-6 position-relative group">
            <div
              className="position-relative"
              onMouseEnter={() => setShowAddButton(true)}
              onMouseLeave={() => setShowAddButton(false)}
            >
              {(product.product_images?.length || 0) > 1 ? (
                <Slider {...sliderSettings}>
                  {product.product_images.map((img, i) => (
                    <div key={i} className="rounded overflow-hidden position-relative">
                      <img
                        src={img.image_url}
                        alt={`Ảnh ${i + 1}`}
                        className="img-fluid rounded w-100"
                        style={{ height: "350px", objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </Slider>
              ) : (
                <img
                  src={product.product_images[0]?.image_url || "/placeholder.png"}
                  alt="Ảnh sản phẩm"
                  className="img-fluid rounded w-100"
                  style={{ height: "350px", objectFit: "cover" }}
                />
              )}

              {showAddButton && (
                <button
                  onClick={() => setShowImageModal(true)}
                  className="btn btn-sm btn-primary position-absolute top-0 end-0 m-2"
                  style={{ zIndex: 10 }}
                >
                  <FaPlus className="me-1" /> Thêm ảnh
                </button>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <h3 className="fw-bold text-primary mb-3">{product.name}</h3>
            <p><strong>Thương hiệu:</strong> {product.brand?.name || "Không rõ"}</p>
            <p><strong>Danh mục:</strong> {product.category?.name || "Không rõ"}</p>
            <p className="text-danger fs-4 fw-semibold">
              <strong>Giá:</strong>{" "}
              {product.price.toLocaleString("vi-VN")}₫
            </p>
            <p className="text-muted">
              <strong>Mô tả ngắn:</strong> {product.short_description || "Không có mô tả"}
            </p>
            <p className="mt-2">
              <strong>Mô tả chi tiết:</strong>{" "}
              <button className="btn btn-primary p-1" onClick={() => setShowDescriptionModal(true)}>
                Xem chi tiết
              </button>
            </p>

            <DescriptionModal
              show={showDescriptionModal}
              onClose={() => setShowDescriptionModal(false)}
              description={product.description}
            />

            <p>
              <strong>Trạng thái:</strong>{" "}
              <span className={`badge ${product.status ? "bg-success" : "bg-secondary"}`}>
                {product.status ? "Hiển thị" : "Ẩn"}
              </span>
            </p>

            <p><strong>Tồn kho:</strong> {product.product_variants.reduce((sum, v) => sum + v.quantity, 0)} sản phẩm</p>

            <button onClick={() => router.back()} className="btn btn-outline-secondary mt-4">
              ← Quay lại
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h5 className="fw-bold mb-2">Hình ảnh sản phẩm</h5>
          <div className="d-flex flex-wrap gap-3">
            {product.product_images.map((img, idx) => (
              <div
                key={idx}
                className="position-relative"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredImageId(img.id)}
                onMouseLeave={() => setHoveredImageId(null)}
              >
                <img
                  src={img.image_url}
                  alt={`Ảnh ${idx + 1}`}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                    transition: "0.3s",
                    border: "2px solid transparent"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0d6efd")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                />
                {product.product_images.length > 1 && hoveredImageId === img.id && (
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="btn btn-sm btn-danger position-absolute top-1 end-1"
                    title="Xoá ảnh"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-md p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Danh sách biến thể</h5>
          <button onClick={() => setShowModal(true)} className="btn btn-sm btn-primary">
            + Thêm biến thể
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Màu</th>
                <th>Mã màu</th>
                <th>Giá gốc</th>
                <th>Giảm</th>
                <th>Giá đang khuyến mãi</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {renderProductVariants()}
            </tbody>
          </table>
        </div>
      </div>

      <ImageUploadModal
        show={showImageModal}
        onClose={() => setShowImageModal(false)}
        onUpload={handleUploadImages}
      />

      <ProductVariantModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={fetchProduct}
        productId={product.id}
        productPrice={product.price}
      />

      <ProductVariantModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onAdd={fetchProduct}
        productId={product.id}
        productPrice={product.price}
        mode="edit"
        initialData={editVariant}
      />

      <ProductVariantModal
        show={showAddQuantityModal}
        onClose={() => setShowAddQuantityModal(false)}
        onAdd={fetchProduct}
        productId={product.id}
        productPrice={product.price}
        mode="add_quantity"
        initialData={currentVariant}
      />
      <ModalConfirmStatus
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          confirmModal.onConfirm?.();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        message={confirmModal.message}
      />
      <ModalSuccess
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        message={successModal.message}
      />
      <ModalError
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        message={errorModal.message}
      />
    </div>
  );
};

export default ProductDetail;