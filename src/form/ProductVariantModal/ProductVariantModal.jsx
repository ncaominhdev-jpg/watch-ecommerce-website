import React, { useState, useEffect } from "react";

const ProductVariantModal = ({
    show,
    onClose,
    onAdd,
    productId,
    productPrice,
    mode = "add", // "add" | "edit" | "add_quantity"
    initialData = {},
}) => {
    const [variant, setVariant] = useState({
        name_color: "",
        code_color: "#000000",
        price: "",
        discount: "",
        quantity: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // 🔄 Fill dữ liệu khi edit hoặc add_quantity
    useEffect(() => {
        if ((mode === "edit" || mode === "add_quantity") && initialData) {
            setVariant({
                name_color: initialData.name_color || "",
                code_color: initialData.code_color || "#000000",
                price: initialData.price || "",
                discount: initialData.discount || "",
                quantity: "",
            });
        }
    }, [mode, initialData]);

    const handleChange = (field, value) => {
        setVariant((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const handleSubmit = async () => {
        const newErrors = {};

        if (mode === "add" || mode === "edit") {
            if (!variant.name_color) {
                newErrors.name_color = "Tên màu không được bỏ trống.";
            }

            if (!variant.price) {
                newErrors.price = "Giá không được bỏ trống.";
            } else if (variant.price < 0) {
                newErrors.price = "Giá không hợp lệ.";
            } else if (Number(variant.price) > Number(productPrice)) {
                newErrors.price = "Giá biến thể không được lớn hơn giá sản phẩm.";
            }

            if (variant.discount) {
                if (variant.discount < 0) {
                    newErrors.discount = "Giảm giá không hợp lệ.";
                } else if (Number(variant.discount) > Number(variant.price)) {
                    newErrors.discount = "Giảm giá không được lớn hơn giá biến thể.";
                }
            }
        }

        if (mode === "add" || mode === "add_quantity") {
            if (!variant.quantity) {
                newErrors.quantity = "Số lượng không được bỏ trống.";
            } else if (variant.quantity < 0) {
                newErrors.quantity = "Số lượng không hợp lệ.";
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setApiError("");

        try {
            if (mode === "edit") {
                const response = await fetch(`/api/products/variants/${initialData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name_color: variant.name_color,
                        code_color: variant.code_color,
                        price: variant.price,
                        discount: variant.discount,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setApiError(data.error || "Không thể cập nhật biến thể.");
                    return;
                }

                onAdd(); // reload list
                onClose();
            } else if (mode === "add_quantity") {
                // 🔄 PATCH số lượng
                const response = await fetch(`/api/products/variants/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        quantity: Number(initialData.quantity) + Number(variant.quantity),
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setApiError(data.error || "Không thể thêm số lượng.");
                    return;
                }

                onAdd();
                onClose();
            } else {
                // ✅ Thêm mới (POST)
                const checkResponse = await fetch(`/api/products/variants/?product_id=${productId}&name_color=${encodeURIComponent(variant.name_color)}`);
                const checkData = await checkResponse.json();

                if (checkData.exists) {
                    setErrors((prev) => ({
                        ...prev,
                        name_color: "Tên màu này đã tồn tại cho sản phẩm.",
                    }));
                    setLoading(false);
                    return;
                }

                const response = await fetch("/api/products/variants", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        name_color: variant.name_color,
                        code_color: variant.code_color,
                        quantity: variant.quantity,
                        price: variant.price,
                        discount: variant.discount,
                        status: true,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setApiError(data.error || "Không thể thêm biến thể.");
                    return;
                }

                onAdd();
                onClose();
                setVariant({
                    name_color: "",
                    code_color: "#000000",
                    price: "",
                    discount: "",
                    quantity: "",
                });
                setErrors({});
            }
        } catch (error) {
            console.error("Lỗi gọi API biến thể:", error);
            setApiError("Đã xảy ra lỗi, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-3">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {mode === "edit"
                                    ? "Chỉnh sửa biến thể"
                                    : mode === "add_quantity"
                                        ? "Thêm số lượng"
                                        : "Thêm biến thể sản phẩm"}
                            </h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {apiError && <div className="alert alert-danger">{apiError}</div>}

                            {mode !== "add_quantity" && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Tên màu</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name_color ? "is-invalid" : ""}`}
                                            value={variant.name_color}
                                            onChange={(e) => handleChange("name_color", e.target.value)}
                                        />
                                        {errors.name_color && (
                                            <div className="invalid-feedback">{errors.name_color}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Mã màu</label>
                                        <input
                                            type="color"
                                            className="form-control form-control-color"
                                            value={variant.code_color}
                                            onChange={(e) => handleChange("code_color", e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Giá (₫)</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.price ? "is-invalid" : ""}`}
                                            value={variant.price}
                                            onChange={(e) => handleChange("price", e.target.value)}
                                        />
                                        {errors.price && (
                                            <div className="invalid-feedback">{errors.price}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Giảm giá (₫)</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.discount ? "is-invalid" : ""}`}
                                            value={variant.discount}
                                            onChange={(e) => handleChange("discount", e.target.value)}
                                        />
                                        {errors.discount && (
                                            <div className="invalid-feedback">{errors.discount}</div>
                                        )}
                                    </div>
                                </>
                            )}

                            {(mode === "add" || mode === "add_quantity") && (
                                <div className="mb-3">
                                    <label className="form-label">Số lượng</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                                        value={variant.quantity}
                                        onChange={(e) => handleChange("quantity", e.target.value)}
                                    />
                                    {errors.quantity && (
                                        <div className="invalid-feedback">{errors.quantity}</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>
                                Huỷ
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading
                                    ? mode === "edit"
                                        ? "Đang cập nhật..."
                                        : mode === "add_quantity"
                                            ? "Đang thêm..."
                                            : "Đang thêm..."
                                    : mode === "edit"
                                        ? "Cập nhật"
                                        : mode === "add_quantity"
                                            ? "Thêm"
                                            : "Thêm"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1050 }}
                onClick={onClose}
            ></div>
        </>
    );
};

export default ProductVariantModal;
